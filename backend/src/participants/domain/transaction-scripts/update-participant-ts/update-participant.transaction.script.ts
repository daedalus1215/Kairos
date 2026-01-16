import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ParticipantRepository } from 'src/participants/infra/repositories/participant.repository';
import { UpdateParticipantDto } from 'src/participants/apps/dtos/requests/update-participant.dto';
import { Participant } from 'src/participants/domain/entities/participant.entity';

@Injectable()
export class UpdateParticipantTransactionScript {
  constructor(private readonly participantRepository: ParticipantRepository) {}

  apply = async (
    participantId: number,
    dto: UpdateParticipantDto,
    userId: number,
  ): Promise<Participant> => {
    const participant = await this.participantRepository.findById(participantId);
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }
    if (participant.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: Partial<Participant> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.role !== undefined) updateData.role = dto.role;
    if (dto.hourlyRate !== undefined) updateData.hourlyRate = dto.hourlyRate;
    if (dto.color !== undefined) updateData.color = dto.color;

    const updated = await this.participantRepository.update(participantId, updateData);
    if (!updated) {
      throw new NotFoundException('Failed to update participant');
    }
    return updated;
  };
}
