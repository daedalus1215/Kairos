import { Post, Body } from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService, MeetingDetailProjection } from 'src/meetings/domain/services/meeting.service';
import { CreateMeetingDto } from 'src/meetings/apps/dtos/requests/create-meeting.dto';
import { MeetingsController } from 'src/meetings/apps/controllers/meetings.controller';
import { StartMeetingSwagger } from './start-meeting.swagger';

@MeetingsController()
export class StartMeetingAction {
  constructor(private readonly meetingService: MeetingService) {}

  @Post()
  @StartMeetingSwagger()
  apply(
    @Body() dto: CreateMeetingDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingDetailProjection> {
    return this.meetingService.startMeeting(
      { title: dto.title, participantIds: dto.participantIds },
      user.userId,
    );
  }
}
