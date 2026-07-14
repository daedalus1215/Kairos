import { Injectable } from '@nestjs/common';
import { ParticipantRepository } from './participant.repository';
import {
  ParticipantAggregatorPort,
  ParticipantProjection,
} from 'src/meetings/domain/ports/participant-aggregator.port';

@Injectable()
export class ParticipantAggregator implements ParticipantAggregatorPort {
  constructor(
    private readonly participantRepository: ParticipantRepository,
  ) {}

  findById = async (id: number): Promise<ParticipantProjection | null> => {
    const participant = await this.participantRepository.findById(id);
    if (!participant) return null;
    return {
      id: participant.id,
      name: participant.name,
      role: participant.role,
      color: participant.color,
      hourlyRate: Number(participant.hourlyRate),
    };
  };

  findByIdAndUserId = async (id: number, userId: number): Promise<ParticipantProjection | null> => {
    const participant = await this.participantRepository.findByIdAndUserId(id, userId);
    if (!participant) return null;
    return {
      id: participant.id,
      name: participant.name,
      role: participant.role,
      color: participant.color,
      hourlyRate: Number(participant.hourlyRate),
    };
  };
}
