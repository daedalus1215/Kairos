import { Get, Query } from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService, MeetingDetailProjection } from 'src/meetings/domain/services/meeting.service';
import { MeetingsController } from 'src/meetings/apps/controllers/meetings.controller';
import { GetMeetingsSwagger } from './get-meetings.swagger';

@MeetingsController()
export class GetMeetingsAction {
  constructor(private readonly meetingService: MeetingService) {}

  @Get()
  @GetMeetingsSwagger()
  apply(
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<MeetingDetailProjection[]> {
    return this.meetingService.findAll(user.userId, {
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }
}
