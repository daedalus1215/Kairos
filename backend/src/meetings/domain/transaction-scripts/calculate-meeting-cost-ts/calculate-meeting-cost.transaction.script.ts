import { Injectable, Inject } from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from '../../../infra/repositories/meeting-participant.repository';
import { MEETING_STATUS } from '../../../domain/entities/meeting.entity';
import { MeetingCostProjection } from '../../../domain/projections/meeting-cost.projection';
import { ParticipantAggregatorPort, PARTICIPANT_AGGREGATOR } from '../../../domain/ports/participant-aggregator.port';

@Injectable()
export class CalculateMeetingCostTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
    @Inject(PARTICIPANT_AGGREGATOR)
    private readonly participantAggregator: ParticipantAggregatorPort,
  ) {}

  apply = async (meetingId: number): Promise<MeetingCostProjection | null> => {
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting || meeting.status !== MEETING_STATUS.ACTIVE) {
      return null;
    }
    if (meeting.pausedAt !== null) {
      return null;
    }

    const now = new Date();
    const elapsedSeconds = Math.floor(
      (now.getTime() - meeting.startTime.getTime()) / 1000,
    ) - (meeting.totalPausedSeconds ?? 0);

    const meetingParticipants =
      await this.meetingParticipantRepository.findByMeetingId(meetingId);

    let totalCost = 0;
    const participantCosts: { participantId: number; costContribution: number }[] = [];

    for (const mp of meetingParticipants) {
      const participant = await this.participantAggregator.findById(mp.participantId);
      if (!participant) continue;

      const hourlyRate = mp.rateOverride ?? participant.hourlyRate;
      const ratePerSecond = Number(hourlyRate) / 3600;

      const endTime = mp.leftAt ?? now;
      const participantSeconds = Math.floor(
        (endTime.getTime() - mp.joinedAt.getTime()) / 1000,
      );
      const costContribution = participantSeconds * ratePerSecond;

      await this.meetingParticipantRepository.updateCostContribution(mp.id, costContribution);
      totalCost += costContribution;
      participantCosts.push({ participantId: mp.participantId, costContribution });
    }

    await this.meetingRepository.update(meetingId, { totalCost });

    return {
      meetingId,
      totalCost,
      elapsedSeconds,
      participants: participantCosts,
    };
  };
}
