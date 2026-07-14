import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting, MEETING_STATUS } from 'src/meetings/domain/entities/meeting.entity';

@Injectable()
export class MeetingRepository {
  constructor(
    @InjectRepository(Meeting)
    private readonly repository: Repository<Meeting>,
  ) {}

  findById = async (id: number): Promise<Meeting | null> => {
    return this.repository.findOne({ where: { id } });
  };

  findByIdAndUserId = async (
    id: number,
    userId: number,
  ): Promise<Meeting | null> => {
    return this.repository.findOne({ where: { id, userId } });
  };

  findAllByUserId = async (
    userId: number,
    options?: {
      status?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<Meeting[]> => {
    const query = this.repository
      .createQueryBuilder('meeting')
      .where('meeting.userId = :userId', { userId })
      .orderBy('meeting.startTime', 'DESC');

    if (options?.status) {
      query.andWhere('meeting.status = :status', { status: options.status });
    }

    if (options?.limit) {
      query.take(options.limit);
    }

    if (options?.offset) {
      query.skip(options.offset);
    }

    return query.getMany();
  };

  findActiveMeeting = async (userId: number): Promise<Meeting | null> => {
    return this.repository.findOne({
      where: { userId, status: MEETING_STATUS.ACTIVE },
    });
  };

  findAllActive = async (): Promise<Meeting[]> => {
    return this.repository.find({
      where: { status: MEETING_STATUS.ACTIVE },
    });
  };

  create = async (data: Partial<Meeting>): Promise<Meeting> => {
    const meeting = this.repository.create(data);
    return this.repository.save(meeting);
  };

  update = async (id: number, data: Partial<Meeting>): Promise<Meeting | null> => {
    await this.repository.update(id, data);
    return this.findById(id);
  };

  searchByTitle = async (
    userId: number,
    searchTerm: string,
  ): Promise<Meeting[]> => {
    return this.repository
      .createQueryBuilder('meeting')
      .where('meeting.userId = :userId', { userId })
      .andWhere('meeting.title LIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .orderBy('meeting.startTime', 'DESC')
      .getMany();
  };
}
