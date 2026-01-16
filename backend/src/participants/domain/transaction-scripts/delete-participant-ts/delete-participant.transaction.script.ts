import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ParticipantRepository } from 'src/participants/infra/repositories/participant.repository';

@Injectable()
export class DeleteParticipantTransactionScript {
  constructor(private readonly participantRepository: ParticipantRepository) {}

  apply = async (participantId: number, userId: number): Promise<void> => {
    const participant = await this.participantRepository.findById(participantId);
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }
    if (participant.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.participantRepository.delete(participantId);
  };
}
