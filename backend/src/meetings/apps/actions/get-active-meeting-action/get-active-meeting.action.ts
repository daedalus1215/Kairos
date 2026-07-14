import { Get } from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService, MeetingDetailProjection } from 'src/meetings/domain/services/meeting.service';
import { MeetingsController } from 'src/meetings/apps/controllers/meetings.controller';
import { GetActiveMeetingSwagger } from './get-active-meeting.swagger';

@MeetingsController()
export class GetActiveMeetingAction {
  constructor(private readonly meetingService: MeetingService) {}

  @Get('active')
  @GetActiveMeetingSwagger()
  apply(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingDetailProjection | null> {
    return this.meetingService.findActiveMeeting(user.userId);
  }
}
