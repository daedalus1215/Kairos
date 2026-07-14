import { Injectable } from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { Meeting } from '../../../domain/entities/meeting.entity';
import { SearchMeetingsParams } from '../../../domain/commands/search-meetings.command';

@Injectable()
export class SearchMeetingsTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
  ) {}

  apply = async (params: SearchMeetingsParams): Promise<Meeting[]> => {
    return this.meetingRepository.searchByTitle(params.userId, params.searchTerm);
  };
}
