import { Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService, MeetingDetailProjection } from 'src/meetings/domain/services/meeting.service';
import { MeetingsController } from 'src/meetings/apps/controllers/meetings.controller';
import { GetMeetingSwagger } from './get-meeting.swagger';

@MeetingsController()
export class GetMeetingAction {
  constructor(private readonly meetingService: MeetingService) {}

  @Get(':id')
  @GetMeetingSwagger()
  apply(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingDetailProjection> {
    return this.meetingService.findOne(id, user.userId);
  }
}
