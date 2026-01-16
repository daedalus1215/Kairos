import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingNote } from 'src/meetings/domain/entities/meeting-note.entity';

@Injectable()
export class MeetingNoteRepository {
  constructor(
    @InjectRepository(MeetingNote)
    private readonly repository: Repository<MeetingNote>,
  ) {}

  findById = async (id: number): Promise<MeetingNote | null> => {
    return this.repository.findOne({ where: { id } });
  };

  findByMeetingId = async (meetingId: number): Promise<MeetingNote[]> => {
    return this.repository.find({
      where: { meetingId },
      order: { createdAt: 'DESC' },
    });
  };

  create = async (data: Partial<MeetingNote>): Promise<MeetingNote> => {
    const note = this.repository.create(data);
    return this.repository.save(note);
  };

  update = async (
    id: number,
    data: Partial<MeetingNote>,
  ): Promise<MeetingNote | null> => {
    await this.repository.update(id, data);
    return this.findById(id);
  };

  delete = async (id: number): Promise<void> => {
    await this.repository.delete(id);
  };
}
