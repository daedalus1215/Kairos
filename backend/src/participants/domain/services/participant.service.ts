import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ParticipantRepository } from 'src/participants/infra/repositories/participant.repository';
import { CreateParticipantTransactionScript } from '../transaction-scripts/create-participant-ts/create-participant.transaction.script';
import { UpdateParticipantTransactionScript } from '../transaction-scripts/update-participant-ts/update-participant.transaction.script';
import { DeleteParticipantTransactionScript } from '../transaction-scripts/delete-participant-ts/delete-participant.transaction.script';
import { CreateParticipantDto } from 'src/participants/apps/dtos/requests/create-participant.dto';
import { UpdateParticipantDto } from 'src/participants/apps/dtos/requests/update-participant.dto';
import { ParticipantResponseDto } from 'src/participants/apps/dtos/responses/participant-response.dto';
import { Participant } from '../entities/participant.entity';

@Injectable()
export class ParticipantService {
  constructor(
    private readonly participantRepository: ParticipantRepository,
    private readonly createParticipantTS: CreateParticipantTransactionScript,
    private readonly updateParticipantTS: UpdateParticipantTransactionScript,
    private readonly deleteParticipantTS: DeleteParticipantTransactionScript,
  ) {}

  create = async (
    dto: CreateParticipantDto,
    userId: number,
  ): Promise<ParticipantResponseDto> => {
    const participant = await this.createParticipantTS.apply(dto, userId);
    return this.toResponseDto(participant);
  };

  findAll = async (userId: number): Promise<ParticipantResponseDto[]> => {
    const participants = await this.participantRepository.findAllByUserId(userId);
    return participants.map(this.toResponseDto);
  };

  findOne = async (
    participantId: number,
    userId: number,
  ): Promise<ParticipantResponseDto> => {
    const participant = await this.participantRepository.findById(participantId);
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }
    if (participant.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return this.toResponseDto(participant);
  };

  update = async (
    participantId: number,
    dto: UpdateParticipantDto,
    userId: number,
  ): Promise<ParticipantResponseDto> => {
    const participant = await this.updateParticipantTS.apply(
      participantId,
      dto,
      userId,
    );
    return this.toResponseDto(participant);
  };

  delete = async (participantId: number, userId: number): Promise<void> => {
    await this.deleteParticipantTS.apply(participantId, userId);
  };

  private toResponseDto = (participant: Participant): ParticipantResponseDto => ({
    id: participant.id,
    name: participant.name,
    role: participant.role,
    hourlyRate: Number(participant.hourlyRate),
    color: participant.color,
    createdAt: participant.createdAt,
    updatedAt: participant.updatedAt,
  });
}
