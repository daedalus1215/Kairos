import { Get, Query } from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService, MeetingDetailProjection } from 'src/meetings/domain/services/meeting.service';
import { MeetingsController } from 'src/meetings/apps/controllers/meetings.controller';
import { SearchMeetingsSwagger } from './search-meetings.swagger';

@MeetingsController()
export class SearchMeetingsAction {
  constructor(private readonly meetingService: MeetingService) {}

  @Get('search')
  @SearchMeetingsSwagger()
  apply(
    @CurrentUser() user: CurrentUserPayload,
    @Query('q') searchTerm: string,
  ): Promise<MeetingDetailProjection[]> {
    return this.meetingService.search(user.userId, searchTerm || '');
  }
}
