import { Injectable } from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { Meeting } from '../../../domain/entities/meeting.entity';
import { FetchAllMeetingsParams } from '../../../domain/commands/fetch-all-meetings.command';

@Injectable()
export class FetchAllMeetingsTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
  ) {}

  apply = async (params: FetchAllMeetingsParams): Promise<Meeting[]> => {
    return this.meetingRepository.findAllByUserId(params.userId, params.options);
  };
}
