import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { MeetingRepository } from 'src/meetings/infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from 'src/meetings/infra/repositories/meeting-participant.repository';
import { ParticipantRepository } from 'src/participants/infra/repositories/participant.repository';
import { AddParticipantDto } from 'src/meetings/apps/dtos/requests/add-participant.dto';
import { MeetingParticipant } from 'src/meetings/domain/entities/meeting-participant.entity';
import { MEETING_STATUS } from 'src/meetings/domain/entities/meeting.entity';

@Injectable()
export class AddParticipantToMeetingTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
    private readonly participantRepository: ParticipantRepository,
  ) {}

  apply = async (
    meetingId: number,
    dto: AddParticipantDto,
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

    const participant = await this.participantRepository.findByIdAndUserId(
      dto.participantId,
      userId,
    );
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Check if participant is already in the meeting
    const existingParticipant =
      await this.meetingParticipantRepository.findByMeetingAndParticipant(
        meetingId,
        dto.participantId,
      );
    if (existingParticipant) {
      throw new BadRequestException('Participant is already in the meeting');
    }

    return this.meetingParticipantRepository.create({
      meetingId,
      participantId: dto.participantId,
      joinedAt: new Date(),
      rateOverride: dto.rateOverride ?? null,
      costContribution: 0,
    });
  };
}
