import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { Meeting } from '../../../domain/entities/meeting.entity';
import { FetchMeetingParams } from '../../../domain/commands/fetch-meeting.command';

@Injectable()
export class FetchMeetingTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
  ) {}

  apply = async (params: FetchMeetingParams): Promise<Meeting> => {
    const meeting = await this.meetingRepository.findById(params.meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.userId !== params.userId) {
      throw new ForbiddenException('Access denied');
    }
    return meeting;
  };
}
