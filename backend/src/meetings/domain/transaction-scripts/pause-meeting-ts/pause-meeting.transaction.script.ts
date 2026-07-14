import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from '../../../infra/repositories/meeting-participant.repository';
import { MEETING_STATUS } from '../../../domain/entities/meeting.entity';
import { PauseMeetingParams } from '../../../domain/commands/pause-meeting.command';
import { MeetingPauseProjection } from '../../../domain/projections/meeting-pause.projection';
import { ParticipantAggregatorPort } from '../../../domain/ports/participant-aggregator.port';

@Injectable()
export class PauseMeetingTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
    private readonly participantAggregator: ParticipantAggregatorPort,
  ) {}

  apply = async (params: PauseMeetingParams): Promise<MeetingPauseProjection> => {
    const meeting = await this.meetingRepository.findById(params.meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.userId !== params.userId) {
      throw new ForbiddenException('Only the meeting creator can pause');
    }
    if (meeting.status !== MEETING_STATUS.ACTIVE) {
      throw new BadRequestException('Meeting is not active');
    }
    if (meeting.pausedAt !== null) {
      throw new BadRequestException('Meeting is already paused');
    }

    const pausedAt = new Date();
    await this.meetingRepository.update(params.meetingId, { pausedAt });

    const meetingParticipants =
      await this.meetingParticipantRepository.findByMeetingId(params.meetingId);

    let totalCost = 0;
    for (const mp of meetingParticipants) {
      const participant = await this.participantAggregator.findById(mp.participantId);
      if (!participant) continue;

      const hourlyRate = mp.rateOverride ?? participant.hourlyRate;
      const ratePerSecond = Number(hourlyRate) / 3600;

      const endTime = mp.leftAt ?? pausedAt;
      const participantSeconds = Math.floor(
        (endTime.getTime() - mp.joinedAt.getTime()) / 1000,
      );
      const costContribution = participantSeconds * ratePerSecond;

      await this.meetingParticipantRepository.updateCostContribution(
        mp.id,
        costContribution,
      );
      totalCost += costContribution;
    }

    await this.meetingRepository.update(params.meetingId, { totalCost });

    const elapsedSeconds = Math.floor(
      (pausedAt.getTime() - meeting.startTime.getTime()) / 1000,
    ) - (meeting.totalPausedSeconds ?? 0);

    return {
      meetingId: params.meetingId,
      pausedAt,
      totalPausedSeconds: meeting.totalPausedSeconds ?? 0,
      totalCost,
      elapsedSeconds,
    };
  };
}
