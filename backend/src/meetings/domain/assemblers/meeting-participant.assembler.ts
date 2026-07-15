import { Injectable, Inject } from '@nestjs/common';
import { MeetingParticipant } from '../entities/meeting-participant.entity';
import { ParticipantAggregatorPort, PARTICIPANT_AGGREGATOR, ParticipantProjection } from '../ports/participant-aggregator.port';
import { MeetingParticipantProjection } from '../projections/meeting-detail.projection';

@Injectable()
export class MeetingParticipantAssembler {
  constructor(
    @Inject(PARTICIPANT_AGGREGATOR)
    private readonly participantAggregator: ParticipantAggregatorPort,
  ) {}

  apply = async (mp: MeetingParticipant): Promise<MeetingParticipantProjection> => {
    const participant: ParticipantProjection | null = await this.participantAggregator.findById(mp.participantId);
    return {
      id: mp.id,
      participantId: mp.participantId,
      participantName: participant?.name ?? 'Unknown',
      participantRole: participant?.role ?? null,
      participantColor: participant?.color ?? '#00F5FF',
      hourlyRate: mp.rateOverride ? Number(mp.rateOverride) : Number(participant?.hourlyRate ?? 0),
      joinedAt: mp.joinedAt,
      leftAt: mp.leftAt,
      costContribution: Number(mp.costContribution),
    };
  };
}
