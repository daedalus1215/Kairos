import { Post, Param, ParseIntPipe } from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService, MeetingDetailProjection } from 'src/meetings/domain/services/meeting.service';
import { MeetingsGateway } from 'src/meetings/apps/gateways/meetings.gateway';
import { MeetingsController } from 'src/meetings/apps/controllers/meetings.controller';
import { EndMeetingSwagger } from './end-meeting.swagger';

@MeetingsController()
export class EndMeetingAction {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly meetingsGateway: MeetingsGateway,
  ) {}

  @Post(':id/end')
  @EndMeetingSwagger()
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingDetailProjection> {
    this.meetingsGateway.discardPendingParticipants(id);
    this.meetingsGateway.stopCostCalculation(id);
    this.meetingsGateway.removePausedMeeting(id);
    const meeting = await this.meetingService.endMeeting(id, user.userId);
    this.meetingsGateway.broadcastToMeeting(id, 'meeting:end', meeting);
    return meeting;
  }
}
