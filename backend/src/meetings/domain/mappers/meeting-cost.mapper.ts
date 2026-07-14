import { Injectable } from '@nestjs/common';
import { Meeting } from '../entities/meeting.entity';
import { MeetingParticipantRepository } from '../../infra/repositories/meeting-participant.repository';
import { ParticipantAggregatorPort } from '../ports/participant-aggregator.port';
import { MeetingCostProjection } from '../projections/meeting-cost.projection';
import { MEETING_STATUS } from '../entities/meeting.entity';

@Injectable()
export class MeetingCostMapper {
  constructor(
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
    private readonly participantAggregator: ParticipantAggregatorPort,
  ) {}

  apply = async (meeting: Meeting, now: Date): Promise<MeetingCostProjection | null> => {
    if (meeting.status !== MEETING_STATUS.ACTIVE) {
      return null;
    }
    if (meeting.pausedAt !== null) {
      return null;
    }

    const elapsedSeconds = Math.floor(
      (now.getTime() - meeting.startTime.getTime()) / 1000,
    ) - (meeting.totalPausedSeconds ?? 0);

    const meetingParticipants =
      await this.meetingParticipantRepository.findByMeetingId(meeting.id);

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

    return {
      meetingId: meeting.id,
      totalCost,
      elapsedSeconds,
      participants: participantCosts,
    };
  };
}
