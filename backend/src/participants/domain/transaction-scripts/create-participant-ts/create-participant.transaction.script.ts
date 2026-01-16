import { Injectable } from '@nestjs/common';
import { ParticipantRepository } from 'src/participants/infra/repositories/participant.repository';
import { CreateParticipantDto } from 'src/participants/apps/dtos/requests/create-participant.dto';
import { Participant } from 'src/participants/domain/entities/participant.entity';

@Injectable()
export class CreateParticipantTransactionScript {
  constructor(private readonly participantRepository: ParticipantRepository) {}

  apply = async (
    dto: CreateParticipantDto,
    userId: number,
  ): Promise<Participant> => {
    return this.participantRepository.create({
      userId,
      name: dto.name,
      role: dto.role ?? null,
      hourlyRate: dto.hourlyRate,
      color: dto.color ?? '#00F5FF',
    });
  };
}
