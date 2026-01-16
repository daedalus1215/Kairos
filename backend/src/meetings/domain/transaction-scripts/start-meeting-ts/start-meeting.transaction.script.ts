import { Injectable, BadRequestException } from '@nestjs/common';
import { MeetingRepository } from 'src/meetings/infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from 'src/meetings/infra/repositories/meeting-participant.repository';
import { ParticipantRepository } from 'src/participants/infra/repositories/participant.repository';
import { CreateMeetingDto } from 'src/meetings/apps/dtos/requests/create-meeting.dto';
import { Meeting, MEETING_STATUS } from 'src/meetings/domain/entities/meeting.entity';

@Injectable()
export class StartMeetingTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
    private readonly participantRepository: ParticipantRepository,
  ) {}

  apply = async (dto: CreateMeetingDto, userId: number): Promise<Meeting> => {
    // Check if user already has an active meeting
    const activeMeeting = await this.meetingRepository.findActiveMeeting(userId);
    if (activeMeeting) {
      throw new BadRequestException('You already have an active meeting');
    }

    const meeting = await this.meetingRepository.create({
      userId,
      title: dto.title,
      startTime: new Date(),
      status: MEETING_STATUS.ACTIVE,
      totalCost: 0,
    });

    // Add initial participants if provided
    if (dto.participantIds && dto.participantIds.length > 0) {
      const joinedAt = new Date();
      for (const participantId of dto.participantIds) {
        const participant = await this.participantRepository.findByIdAndUserId(
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
