import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MeetingService, MeetingParticipantProjection, PendingParticipantProjection } from 'src/meetings/domain/services/meeting.service';
import { MeetingRepository } from 'src/meetings/infra/repositories/meeting.repository';
import { MEETING_STATUS } from 'src/meetings/domain/entities/meeting.entity';
import { PendingParticipant } from 'src/meetings/domain/commands/resume-meeting.command';

type AuthenticatedSocket = Socket & {
  userId?: number;
  email?: string;
};

@Injectable()
@WebSocketGateway({ namespace: '/meetings' })
export class MeetingsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MeetingsGateway.name);
  private activeMeetings = new Map<number, NodeJS.Timeout>();
  private pausedMeetingIds = new Set<number>();
  private pendingParticipants = new Map<number, PendingParticipant[]>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly meetingService: MeetingService,
    private readonly meetingRepository: MeetingRepository,
  ) {}

  async onModuleInit() {
    await this.recoverActiveMeetings();
  }

  async recoverActiveMeetings() {
    const allActive = await this.meetingRepository.findAllActive();

    for (const meeting of allActive) {
      if (meeting.pausedAt !== null) {
        this.pausedMeetingIds.add(meeting.id);
        this.logger.log(`Recovered paused meeting ${meeting.id}`);
      } else {
        this.logger.log(`Recovered active meeting ${meeting.id}`);
      }
    }

    this.pendingParticipants.clear();
    this.logger.log('Cleared pending participants on restart');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn('Client disconnected: No token provided');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.email = payload.email;
      this.logger.log(`Client connected: ${client.email} (${client.id})`);
    } catch (error) {
      this.logger.warn('Client disconnected: Invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.email} (${client.id})`);
  }

  @SubscribeMessage('meeting:join')
  async handleJoinMeeting(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { meetingId: number },
  ) {
    if (!client.userId) return;

    const room = `meeting-${data.meetingId}`;
    await client.join(room);
    this.logger.log(`User ${client.email} joined room ${room}`);

    if (!this.activeMeetings.has(data.meetingId)) {
      const meeting = await this.meetingRepository.findById(data.meetingId);
      if (meeting && meeting.status === MEETING_STATUS.ACTIVE && meeting.pausedAt === null) {
        this.startCostCalculation(data.meetingId);
      }
    }

    return { success: true, room };
  }

  @SubscribeMessage('meeting:leave')
  async handleLeaveMeeting(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { meetingId: number },
  ) {
    const room = `meeting-${data.meetingId}`;
    await client.leave(room);
    this.logger.log(`User ${client.email} left room ${room}`);

    const roomSockets = await this.server.in(room).fetchSockets();
    if (roomSockets.length === 0 && !this.pausedMeetingIds.has(data.meetingId)) {
      this.stopCostCalculation(data.meetingId);
    }

    return { success: true };
  }

  @SubscribeMessage('meeting:pause')
  async handlePauseMeeting(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { meetingId: number },
  ) {
    if (!client.userId) return;

    try {
      const result = await this.meetingService.pauseMeeting(data.meetingId, client.userId);
      this.pausedMeetingIds.add(data.meetingId);
      this.stopCostCalculation(data.meetingId);
      this.broadcastToMeeting(data.meetingId, 'meeting:pause', result);
    } catch (error) {
      this.logger.error(`Pause failed for meeting ${data.meetingId}`, error);
      throw error;
    }
  }

  @SubscribeMessage('meeting:resume')
  async handleResumeMeeting(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { meetingId: number },
  ) {
    if (!client.userId) return;

    try {
      const pending = this.pendingParticipants.get(data.meetingId) || [];
      const result = await this.meetingService.resumeMeeting(
        data.meetingId,
        client.userId,
        pending,
      );

      this.pendingParticipants.delete(data.meetingId);
      this.pausedMeetingIds.delete(data.meetingId);
      this.startCostCalculation(data.meetingId);
      this.broadcastToMeeting(data.meetingId, 'meeting:resume', result);
    } catch (error) {
      this.logger.error(`Resume failed for meeting ${data.meetingId}`, error);
      throw error;
    }
  }

  @SubscribeMessage('meeting:add:participant')
  async handleAddParticipantWS(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { meetingId: number; participantId: number },
  ) {
    if (!client.userId) return;

    // Check if meeting is paused — delegate to service layer
    const isPaused = await this.isMeetingPaused(data.meetingId);

    if (isPaused) {
      const pendingDto = await this.queuePendingParticipant(
        data.meetingId,
        data.participantId,
        client.userId,
      );
      this.broadcastToMeeting(
        data.meetingId,
        'meeting:participant:pending',
        pendingDto,
      );
      return { success: true, pending: true };
    }

    // Delegate to service — validates and persists via TS
    const participant = await this.meetingService.addParticipant(
      data.meetingId,
      data.participantId,
      client.userId,
    );

    this.broadcastToMeeting(
      data.meetingId,
      'meeting:participant:add',
      participant,
    );
    return { success: true, pending: false, participant };
  }

  // Broadcast to a meeting room
  broadcastToMeeting = (
    meetingId: number,
    event: string,
    data: unknown,
  ): void => {
    this.server.to(`meeting-${meetingId}`).emit(event, data);
  };

  // Start periodic cost calculation for a meeting
  startCostCalculation = (meetingId: number): void => {
    if (this.activeMeetings.has(meetingId)) return;

    const interval = setInterval(async () => {
      try {
        const costUpdate = await this.meetingService.calculateCost(meetingId);
        if (costUpdate) {
          this.broadcastToMeeting(meetingId, 'meeting:cost:update', costUpdate);
        } else {
          this.stopCostCalculation(meetingId);
        }
      } catch (error) {
        this.logger.error(`Error calculating cost for meeting ${meetingId}`, error);
      }
    }, 1000);

    this.activeMeetings.set(meetingId, interval);
    this.logger.log(`Started cost calculation for meeting ${meetingId}`);
  };

  // Stop cost calculation for a meeting
  stopCostCalculation = (meetingId: number): void => {
    const interval = this.activeMeetings.get(meetingId);
    if (interval) {
      clearInterval(interval);
      this.activeMeetings.delete(meetingId);
      this.logger.log(`Stopped cost calculation for meeting ${meetingId}`);
    }
  };

  // Check if a meeting is currently paused (for REST endpoint)
  isMeetingPaused = async (meetingId: number): Promise<boolean> => {
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting || meeting.status !== MEETING_STATUS.ACTIVE) {
      return false;
    }
    return meeting.pausedAt !== null;
  };

  // Queue a participant as pending (called from REST addParticipant when paused)
  // Delegates participant lookup to service; gateway only manages in-memory queue.
  queuePendingParticipant = async (
    meetingId: number,
    participantId: number,
    userId: number,
  ): Promise<PendingParticipantProjection> => {
    // Use a minimal fetch to get participant info for the pending DTO
    // This delegates validation to the service layer
    const result = await this.meetingService.addParticipant(
      meetingId,
      participantId,
      userId,
    );

    const pending: PendingParticipant = {
      participantId: result.participantId,
      participantName: result.participantName,
      participantRole: result.participantRole,
      participantColor: result.participantColor,
      hourlyRate: result.hourlyRate,
    };

    if (!this.pendingParticipants.has(meetingId)) {
      this.pendingParticipants.set(meetingId, []);
    }
    this.pendingParticipants.get(meetingId)!.push(pending);

    return pending as unknown as PendingParticipantProjection;
  };

  // Discard pending participants (called when a meeting ends)
  discardPendingParticipants = (meetingId: number): void => {
    this.pendingParticipants.delete(meetingId);
  };

  // Get pending participants for a meeting (for REST resume endpoint)
  getPendingParticipants = (meetingId: number): PendingParticipant[] | undefined => {
    return this.pendingParticipants.get(meetingId);
  };

  // Remove a meeting from the paused set (called when ending a paused meeting)
  removePausedMeeting = (meetingId: number): void => {
    this.pausedMeetingIds.delete(meetingId);
  };

  // For pause/resume via REST — update in-memory state
  notifyPaused = (meetingId: number): void => {
    this.pausedMeetingIds.add(meetingId);
  };

  notifyResumed = (meetingId: number): void => {
    this.pausedMeetingIds.delete(meetingId);
    const pending = this.pendingParticipants.get(meetingId) || [];
    this.pendingParticipants.delete(meetingId);
  };
}
