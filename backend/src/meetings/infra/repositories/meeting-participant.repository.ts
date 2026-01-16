import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { MeetingParticipant } from 'src/meetings/domain/entities/meeting-participant.entity';

@Injectable()
export class MeetingParticipantRepository {
  constructor(
    @InjectRepository(MeetingParticipant)
    private readonly repository: Repository<MeetingParticipant>,
  ) {}

  findById = async (id: number): Promise<MeetingParticipant | null> => {
    return this.repository.findOne({ where: { id } });
  };

  findByMeetingId = async (meetingId: number): Promise<MeetingParticipant[]> => {
    return this.repository.find({
      where: { meetingId },
      order: { joinedAt: 'ASC' },
    });
  };

  findActiveByMeetingId = async (
    meetingId: number,
  ): Promise<MeetingParticipant[]> => {
    return this.repository.find({
      where: { meetingId, leftAt: IsNull() },
      order: { joinedAt: 'ASC' },
    });
  };

  findByMeetingAndParticipant = async (
    meetingId: number,
    participantId: number,
  ): Promise<MeetingParticipant | null> => {
    return this.repository.findOne({
      where: { meetingId, participantId, leftAt: IsNull() },
    });
  };

  create = async (
    data: Partial<MeetingParticipant>,
  ): Promise<MeetingParticipant> => {
    const meetingParticipant = this.repository.create(data);
    return this.repository.save(meetingParticipant);
  };

  update = async (
    id: number,
    data: Partial<MeetingParticipant>,
  ): Promise<MeetingParticipant | null> => {
    await this.repository.update(id, data);
    return this.findById(id);
  };

  updateCostContribution = async (
    id: number,
    costContribution: number,
  ): Promise<void> => {
    await this.repository.update(id, { costContribution });
  };
}
