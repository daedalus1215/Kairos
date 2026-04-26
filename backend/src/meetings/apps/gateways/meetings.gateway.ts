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
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MeetingService } from 'src/meetings/domain/services/meeting.service';

type AuthenticatedSocket = Socket & {
  userId?: number;
  email?: string;
};

@Injectable()
                                                                                                                                                                                                                                                    @WebSocketGateway({ namespace: '/meetings' })
export class MeetingsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MeetingsGateway.name);
  private activeMeetings = new Map<number, NodeJS.Timeout>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly meetingService: MeetingService,
  ) {}

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

    // Start cost calculation interval if not already running
    this.startCostCalculation(data.meetingId);

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

    // Check if room is empty and stop cost calculation
    const roomSockets = await this.server.in(room).fetchSockets();
    if (roomSockets.length === 0) {
      this.stopCostCalculation(data.meetingId);
    }

    return { success: true };
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
          // Meeting is no longer active, stop calculations
          this.stopCostCalculation(meetingId);
        }
      } catch (error) {
        this.logger.error(`Error calculating cost for meeting ${meetingId}`, error);
      }
    }, 1000); // Update every second

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
}
