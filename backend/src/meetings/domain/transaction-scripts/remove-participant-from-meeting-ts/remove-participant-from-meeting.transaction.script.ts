import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from '../../../infra/repositories/meeting-participant.repository';
import { MeetingParticipant } from '../../../domain/entities/meeting-participant.entity';
import { MEETING_STATUS } from '../../../domain/entities/meeting.entity';
import { RemoveParticipantFromMeetingParams } from '../../../domain/commands/remove-participant-from-meeting.command';

@Injectable()
export class RemoveParticipantFromMeetingTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
  ) {}

  apply = async (params: RemoveParticipantFromMeetingParams): Promise<MeetingParticipant> => {
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

    const meetingParticipant =
      await this.meetingParticipantRepository.findByMeetingAndParticipant(
        params.meetingId,
        params.participantId,
      );
    if (!meetingParticipant) {
      throw new NotFoundException('Participant is not in this meeting');
    }

    const updated = await this.meetingParticipantRepository.update(meetingParticipant.id, {
      leftAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException('Failed to remove participant');
    }

    return updated;
  };
}
