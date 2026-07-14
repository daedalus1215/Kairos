import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from '../../../infra/repositories/meeting-participant.repository';
import { Meeting, MEETING_STATUS } from '../../../domain/entities/meeting.entity';
import { EndMeetingParams } from '../../../domain/commands/end-meeting.command';

@Injectable()
export class EndMeetingTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
  ) {}

  apply = async (params: EndMeetingParams): Promise<Meeting> => {
    const meeting = await this.meetingRepository.findById(params.meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.userId !== params.userId) {
      throw new ForbiddenException('Access denied');
    }
    if (meeting.status !== MEETING_STATUS.ACTIVE) {
      throw new BadRequestException('Meeting is not active');
    }

    const endTime = new Date();

    const activeParticipants =
      await this.meetingParticipantRepository.findActiveByMeetingId(params.meetingId);

    for (const participant of activeParticipants) {
      await this.meetingParticipantRepository.update(participant.id, { leftAt: endTime });
    }

    const updated = await this.meetingRepository.update(params.meetingId, {
      endTime,
      status: MEETING_STATUS.ENDED,
    });

    if (!updated) {
      throw new NotFoundException('Failed to end meeting');
    }

    return updated;
  };
}
