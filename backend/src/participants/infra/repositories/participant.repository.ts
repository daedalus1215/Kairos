import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from 'src/participants/domain/entities/participant.entity';

@Injectable()
export class ParticipantRepository {
  constructor(
    @InjectRepository(Participant)
    private readonly repository: Repository<Participant>,
  ) {}

  findById = async (id: number): Promise<Participant | null> => {
    return this.repository.findOne({ where: { id } });
  };

  findByIdAndUserId = async (
    id: number,
    userId: number,
  ): Promise<Participant | null> => {
    return this.repository.findOne({ where: { id, userId } });
  };

  findAllByUserId = async (userId: number): Promise<Participant[]> => {
    return this.repository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  };

  create = async (data: Partial<Participant>): Promise<Participant> => {
    const participant = this.repository.create(data);
    return this.repository.save(participant);
  };

  update = async (
    id: number,
    data: Partial<Participant>,
  ): Promise<Participant | null> => {
    await this.repository.update(id, data);
    return this.findById(id);
  };

  delete = async (id: number): Promise<void> => {
    await this.repository.delete(id);
  };
}
