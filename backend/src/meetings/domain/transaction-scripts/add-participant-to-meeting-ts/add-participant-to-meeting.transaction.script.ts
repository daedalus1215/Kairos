import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from '../../../infra/repositories/meeting-participant.repository';
import { MeetingParticipant } from '../../../domain/entities/meeting-participant.entity';
import { MEETING_STATUS } from '../../../domain/entities/meeting.entity';
import { AddParticipantToMeetingCommand } from '../../../domain/commands/add-participant-to-meeting.command';
import { ParticipantAggregatorPort, PARTICIPANT_AGGREGATOR } from '../../../domain/ports/participant-aggregator.port';

@Injectable()
export class AddParticipantToMeetingTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
    @Inject(PARTICIPANT_AGGREGATOR)
    private readonly participantAggregator: ParticipantAggregatorPort,
  ) {}

  apply = async (command: AddParticipantToMeetingCommand): Promise<MeetingParticipant> => {
    const meeting = await this.meetingRepository.findById(command.meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.userId !== command.userId) {
      throw new ForbiddenException('Access denied');
    }
    if (meeting.status !== MEETING_STATUS.ACTIVE) {
      throw new BadRequestException('Meeting is not active');
    }

    const participant = await this.participantAggregator.findByIdAndUserId(
      command.participantId,
      command.userId,
    );
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    const existingParticipant =
      await this.meetingParticipantRepository.findByMeetingAndParticipant(
        command.meetingId,
        command.participantId,
      );
    if (existingParticipant) {
      throw new BadRequestException('Participant is already in the meeting');
    }

    return this.meetingParticipantRepository.create({
      meetingId: command.meetingId,
      participantId: command.participantId,
      joinedAt: new Date(),
      rateOverride: command.rateOverride ?? null,
      costContribution: 0,
    });
  };
}
