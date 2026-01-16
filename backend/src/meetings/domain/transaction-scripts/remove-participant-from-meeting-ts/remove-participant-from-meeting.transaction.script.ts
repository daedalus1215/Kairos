import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { MeetingRepository } from 'src/meetings/infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from 'src/meetings/infra/repositories/meeting-participant.repository';
import { MeetingParticipant } from 'src/meetings/domain/entities/meeting-participant.entity';
import { MEETING_STATUS } from 'src/meetings/domain/entities/meeting.entity';

@Injectable()
export class RemoveParticipantFromMeetingTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
  ) {}

  apply = async (
    meetingId: number,
    participantId: number,
    userId: number,
  ): Promise<MeetingParticipant> => {
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

    const meetingParticipant =
      await this.meetingParticipantRepository.findByMeetingAndParticipant(
        meetingId,
        participantId,
      );
    if (!meetingParticipant) {
      throw new NotFoundException('Participant is not in this meeting');
    }

    const updated = await this.meetingParticipantRepository.update(
      meetingParticipant.id,
      { leftAt: new Date() },
    );

    if (!updated) {
      throw new NotFoundException('Failed to remove participant');
    }

    return updated;
  };
}
