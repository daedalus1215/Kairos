import { Injectable } from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { Meeting } from '../../../domain/entities/meeting.entity';

@Injectable()
export class FetchActiveMeetingTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
  ) {}

  apply = async (userId: number): Promise<Meeting | null> => {
    return this.meetingRepository.findActiveMeeting(userId);
  };
}
