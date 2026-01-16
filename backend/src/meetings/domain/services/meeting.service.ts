import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MeetingRepository } from 'src/meetings/infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from 'src/meetings/infra/repositories/meeting-participant.repository';
import { MeetingNoteRepository } from 'src/meetings/infra/repositories/meeting-note.repository';
import { ParticipantRepository } from 'src/participants/infra/repositories/participant.repository';
import { StartMeetingTransactionScript } from '../transaction-scripts/start-meeting-ts/start-meeting.transaction.script';
import { EndMeetingTransactionScript } from '../transaction-scripts/end-meeting-ts/end-meeting.transaction.script';
import { AddParticipantToMeetingTransactionScript } from '../transaction-scripts/add-participant-to-meeting-ts/add-participant-to-meeting.transaction.script';
import { RemoveParticipantFromMeetingTransactionScript } from '../transaction-scripts/remove-participant-from-meeting-ts/remove-participant-from-meeting.transaction.script';
import { CalculateMeetingCostTransactionScript } from '../transaction-scripts/calculate-meeting-cost-ts/calculate-meeting-cost.transaction.script';
import { CreateMeetingDto } from 'src/meetings/apps/dtos/requests/create-meeting.dto';
import { AddParticipantDto } from 'src/meetings/apps/dtos/requests/add-participant.dto';
import { CreateMeetingNoteDto } from 'src/meetings/apps/dtos/requests/create-meeting-note.dto';
import {
  MeetingResponseDto,
  MeetingParticipantResponseDto,
  MeetingNoteResponseDto,
  MeetingCostUpdateDto,
} from 'src/meetings/apps/dtos/responses/meeting-response.dto';
import { Meeting } from '../entities/meeting.entity';
import { MeetingParticipant } from '../entities/meeting-participant.entity';
import { MeetingNote } from '../entities/meeting-note.entity';

@Injectable()
export class MeetingService {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
    private readonly meetingNoteRepository: MeetingNoteRepository,
    private readonly participantRepository: ParticipantRepository,
    private readonly startMeetingTS: StartMeetingTransactionScript,
    private readonly endMeetingTS: EndMeetingTransactionScript,
    private readonly addParticipantTS: AddParticipantToMeetingTransactionScript,
    private readonly removeParticipantTS: RemoveParticipantFromMeetingTransactionScript,
    private readonly calculateCostTS: CalculateMeetingCostTransactionScript,
  ) {}

  startMeeting = async (
    dto: CreateMeetingDto,
    userId: number,
  ): Promise<MeetingResponseDto> => {
    const meeting = await this.startMeetingTS.apply(dto, userId);
    return this.buildMeetingResponse(meeting);
  };

  endMeeting = async (
    meetingId: number,
    userId: number,
  ): Promise<MeetingResponseDto> => {
    const meeting = await this.endMeetingTS.apply(meetingId, userId);
    return this.buildMeetingResponse(meeting);
  };

  addParticipant = async (
    meetingId: number,
    dto: AddParticipantDto,
    userId: number,
  ): Promise<MeetingParticipantResponseDto> => {
    const mp = await this.addParticipantTS.apply(meetingId, dto, userId);
    return this.buildParticipantResponse(mp);
  };

  removeParticipant = async (
    meetingId: number,
    participantId: number,
    userId: number,
  ): Promise<MeetingParticipantResponseDto> => {
    const mp = await this.removeParticipantTS.apply(
      meetingId,
      participantId,
      userId,
    );
    return this.buildParticipantResponse(mp);
  };

  calculateCost = async (
    meetingId: number,
  ): Promise<MeetingCostUpdateDto | null> => {
    return this.calculateCostTS.apply(meetingId);
  };

  findOne = async (
    meetingId: number,
    userId: number,
  ): Promise<MeetingResponseDto> => {
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return this.buildMeetingResponse(meeting);
  };

  findAll = async (
    userId: number,
    options?: { status?: string; limit?: number; offset?: number },
  ): Promise<MeetingResponseDto[]> => {
    const meetings = await this.meetingRepository.findAllByUserId(userId, options);
    return Promise.all(meetings.map((m) => this.buildMeetingResponse(m)));
  };

  findActiveMeeting = async (
    userId: number,
  ): Promise<MeetingResponseDto | null> => {
    const meeting = await this.meetingRepository.findActiveMeeting(userId);
    if (!meeting) return null;
    return this.buildMeetingResponse(meeting);
  };

  search = async (
    userId: number,
    searchTerm: string,
  ): Promise<MeetingResponseDto[]> => {
    const meetings = await this.meetingRepository.searchByTitle(userId, searchTerm);
    return Promise.all(meetings.map((m) => this.buildMeetingResponse(m)));
  };

  // Notes
  addNote = async (
    meetingId: number,
    dto: CreateMeetingNoteDto,
    userId: number,
  ): Promise<MeetingNoteResponseDto> => {
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const note = await this.meetingNoteRepository.create({
      meetingId,
      content: dto.content,
    });
    return this.toNoteResponse(note);
  };

  getNotes = async (
    meetingId: number,
    userId: number,
  ): Promise<MeetingNoteResponseDto[]> => {
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const notes = await this.meetingNoteRepository.findByMeetingId(meetingId);
    return notes.map(this.toNoteResponse);
  };

  updateNote = async (
    meetingId: number,
    noteId: number,
    dto: CreateMeetingNoteDto,
    userId: number,
  ): Promise<MeetingNoteResponseDto> => {
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const note = await this.meetingNoteRepository.findById(noteId);
    if (!note || note.meetingId !== meetingId) {
      throw new NotFoundException('Note not found');
    }

    const updated = await this.meetingNoteRepository.update(noteId, {
      content: dto.content,
    });
    if (!updated) {
      throw new NotFoundException('Failed to update note');
    }
    return this.toNoteResponse(updated);
  };

  deleteNote = async (
    meetingId: number,
    noteId: number,
    userId: number,
  ): Promise<void> => {
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const note = await this.meetingNoteRepository.findById(noteId);
    if (!note || note.meetingId !== meetingId) {
      throw new NotFoundException('Note not found');
    }

    await this.meetingNoteRepository.delete(noteId);
  };

  private buildMeetingResponse = async (
    meeting: Meeting,
  ): Promise<MeetingResponseDto> => {
    const meetingParticipants =
      await this.meetingParticipantRepository.findByMeetingId(meeting.id);
    const participants = await Promise.all(
      meetingParticipants.map((mp) => this.buildParticipantResponse(mp)),
    );

    return {
      id: meeting.id,
      title: meeting.title,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      totalCost: Number(meeting.totalCost),
      status: meeting.status,
      participants,
      createdAt: meeting.createdAt,
    };
  };

  private buildParticipantResponse = async (
    mp: MeetingParticipant,
  ): Promise<MeetingParticipantResponseDto> => {
    const participant = await this.participantRepository.findById(mp.participantId);
    return {
      id: mp.id,
      participantId: mp.participantId,
      participantName: participant?.name ?? 'Unknown',
      participantRole: participant?.role ?? null,
      participantColor: participant?.color ?? '#00F5FF',
      hourlyRate: mp.rateOverride
        ? Number(mp.rateOverride)
        : Number(participant?.hourlyRate ?? 0),
      joinedAt: mp.joinedAt,
      leftAt: mp.leftAt,
      costContribution: Number(mp.costContribution),
    };
  };

  private toNoteResponse = (note: MeetingNote): MeetingNoteResponseDto => ({
    id: note.id,
    meetingId: note.meetingId,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  });
}
