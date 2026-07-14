import { Injectable, BadRequestException } from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from '../../../infra/repositories/meeting-participant.repository';
import { MEETING_STATUS, Meeting } from '../../../domain/entities/meeting.entity';
import { StartMeetingCommand } from '../../../domain/commands/start-meeting.command';
import { ParticipantAggregatorPort } from '../../../domain/ports/participant-aggregator.port';

@Injectable()
export class StartMeetingTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
    private readonly participantAggregator: ParticipantAggregatorPort,
  ) {}

  apply = async (command: StartMeetingCommand, userId: number): Promise<Meeting> => {
    const activeMeeting = await this.meetingRepository.findActiveMeeting(userId);
    if (activeMeeting) {
      throw new BadRequestException('You already have an active meeting');
    }

    const meeting = await this.meetingRepository.create({
      userId,
      title: command.title,
      startTime: new Date(),
      status: MEETING_STATUS.ACTIVE,
      totalCost: 0,
    });

    if (command.participantIds && command.participantIds.length > 0) {
      const joinedAt = new Date();
      for (const participantId of command.participantIds) {
        const participant = await this.participantAggregator.findByIdAndUserId(
          participantId,
          userId,
        );
        if (participant) {
          await this.meetingParticipantRepository.create({
            meetingId: meeting.id,
            participantId: participant.id,
            joinedAt,
            rateOverride: null,
            costContribution: 0,
          });
        }
      }
    }

    return meeting;
  };
}
