import { Injectable } from '@nestjs/common';
import { MeetingRepository } from 'src/meetings/infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from 'src/meetings/infra/repositories/meeting-participant.repository';
import { ParticipantRepository } from 'src/participants/infra/repositories/participant.repository';
import { MeetingCostUpdateDto } from 'src/meetings/apps/dtos/responses/meeting-response.dto';
import { MEETING_STATUS } from 'src/meetings/domain/entities/meeting.entity';

@Injectable()
export class CalculateMeetingCostTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
    private readonly participantRepository: ParticipantRepository,
  ) {}

  apply = async (meetingId: number): Promise<MeetingCostUpdateDto | null> => {
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting || meeting.status !== MEETING_STATUS.ACTIVE) {
      return null;
    }

    const now = new Date();
    const elapsedSeconds = Math.floor(
      (now.getTime() - meeting.startTime.getTime()) / 1000,
    );

    const meetingParticipants =
      await this.meetingParticipantRepository.findByMeetingId(meetingId);

    let totalCost = 0;
    const participantCosts: { participantId: number; costContribution: number }[] =
      [];

    for (const mp of meetingParticipants) {
      const participant = await this.participantRepository.findById(
        mp.participantId,
      );
      if (!participant) continue;

      const hourlyRate = mp.rateOverride ?? participant.hourlyRate;
      const ratePerSecond = Number(hourlyRate) / 3600;

      const endTime = mp.leftAt ?? now;
      const participantSeconds = Math.floor(
        (endTime.getTime() - mp.joinedAt.getTime()) / 1000,
      );
      const costContribution = participantSeconds * ratePerSecond;

      // Update cost contribution in database
      await this.meetingParticipantRepository.updateCostContribution(
        mp.id,
        costContribution,
      );

      totalCost += costContribution;
      participantCosts.push({
        participantId: mp.participantId,
        costContribution,
      });
    }

    // Update total cost in meeting
    await this.meetingRepository.update(meetingId, { totalCost });

    return {
      meetingId,
      totalCost,
      elapsedSeconds,
      participants: participantCosts,
    };
  };
}
