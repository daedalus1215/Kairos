import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { MeetingRepository } from 'src/meetings/infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from 'src/meetings/infra/repositories/meeting-participant.repository';
import { Meeting, MEETING_STATUS } from 'src/meetings/domain/entities/meeting.entity';

@Injectable()
export class EndMeetingTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
  ) {}

  apply = async (meetingId: number, userId: number): Promise<Meeting> => {
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    if (meeting.status !== MEETING_STATUS.ACTIVE) {
      throw new BadRequestException('Meeting is not active');
    }

    const endTime = new Date();

    // End all active participants
    const activeParticipants =
      await this.meetingParticipantRepository.findActiveByMeetingId(meetingId);

    for (const participant of activeParticipants) {
      await this.meetingParticipantRepository.update(participant.id, {
        leftAt: endTime,
      });
    }

    const updated = await this.meetingRepository.update(meetingId, {
      endTime,
      status: MEETING_STATUS.ENDED,
    });

    if (!updated) {
      throw new NotFoundException('Failed to end meeting');
    }

    return updated;
  };
}
