import { Injectable } from '@nestjs/common';
import { Meeting } from '../entities/meeting.entity';
import { MeetingParticipantRepository } from '../../infra/repositories/meeting-participant.repository';
import { MeetingParticipantAssembler } from '../assemblers/meeting-participant.assembler';
import { MeetingDetailProjection } from '../projections/meeting-detail.projection';

@Injectable()
export class MeetingResponseMapper {
  constructor(
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
    private readonly meetingParticipantAssembler: MeetingParticipantAssembler,
  ) {}

  apply = async (meeting: Meeting): Promise<MeetingDetailProjection> => {
    const meetingParticipants =
      await this.meetingParticipantRepository.findByMeetingId(meeting.id);
    const participants = await Promise.all(
      meetingParticipants.map((mp) => this.meetingParticipantAssembler.apply(mp)),
    );

    return {
      id: meeting.id,
      title: meeting.title,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      totalCost: Number(meeting.totalCost),
      status: meeting.status,
      participants,
      pausedAt: meeting.pausedAt,
      totalPausedSeconds: meeting.totalPausedSeconds ?? 0,
      createdAt: meeting.createdAt,
    };
  };
}
