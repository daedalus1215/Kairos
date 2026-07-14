export interface ParticipantAggregatorPort {
  findById(id: number): Promise<ParticipantProjection | null>;
  findByIdAndUserId(id: number, userId: number): Promise<ParticipantProjection | null>;
}

export interface ParticipantProjection {
  id: number;
  name: string;
  role: string | null;
  color: string;
  hourlyRate: number;
}

export const PARTICIPANT_AGGREGATOR = Symbol('PARTICIPANT_AGGREGATOR');
