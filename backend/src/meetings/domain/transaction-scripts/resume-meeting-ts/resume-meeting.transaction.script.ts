import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from '../../../infra/repositories/meeting-participant.repository';
import { MEETING_STATUS } from '../../../domain/entities/meeting.entity';
import { ResumeMeetingParams, PendingParticipant } from '../../../domain/commands/resume-meeting.command';
import { MeetingResumeProjection } from '../../../domain/projections/meeting-resume.projection';
import { ParticipantAggregatorPort } from '../../../domain/ports/participant-aggregator.port';

@Injectable()
export class ResumeMeetingTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingParticipantRepository: MeetingParticipantRepository,
    private readonly participantAggregator: ParticipantAggregatorPort,
  ) {}

  apply = async (params: ResumeMeetingParams): Promise<MeetingResumeProjection> => {
    const meeting = await this.meetingRepository.findById(params.meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.userId !== params.userId) {
      throw new ForbiddenException('Only the meeting creator can resume');
    }
    if (meeting.status !== MEETING_STATUS.ACTIVE) {
      throw new BadRequestException('Meeting is not active');
    }
    if (meeting.pausedAt === null) {
      throw new BadRequestException('Meeting is not paused');
    }

    const now = new Date();
    const pausedDuration = Math.floor(
      (now.getTime() - meeting.pausedAt.getTime()) / 1000,
    );
    const newTotalPausedSeconds = (meeting.totalPausedSeconds ?? 0) + pausedDuration;

    await this.meetingRepository.update(params.meetingId, {
      pausedAt: null,
      totalPausedSeconds: newTotalPausedSeconds,
    });

    const pending = params.pendingParticipants ?? [];
    for (const pp of pending) {
      const participant = await this.participantAggregator.findByIdAndUserId(
        pp.participantId,
        params.userId,
      );
      if (!participant) continue;

      await this.meetingParticipantRepository.create({
        meetingId: params.meetingId,
        participantId: participant.id,
        joinedAt: now,
        rateOverride: null,
        costContribution: 0,
      });
    }

    const meetingParticipants =
      await this.meetingParticipantRepository.findByMeetingId(params.meetingId);

    let totalCost = 0;
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
    }

    await this.meetingRepository.update(params.meetingId, { totalCost });

    const elapsedSeconds = Math.floor(
      (now.getTime() - meeting.startTime.getTime()) / 1000,
    ) - newTotalPausedSeconds;

    return {
      meetingId: params.meetingId,
      resumedAt: now,
      totalPausedSeconds: newTotalPausedSeconds,
      totalCost,
      elapsedSeconds,
    };
  };
}
