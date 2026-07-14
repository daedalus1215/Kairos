import { Post, Param, ParseIntPipe } from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService, MeetingPauseProjection } from 'src/meetings/domain/services/meeting.service';
import { MeetingsGateway } from 'src/meetings/apps/gateways/meetings.gateway';
import { MeetingsController } from 'src/meetings/apps/controllers/meetings.controller';
import { PauseMeetingSwagger } from './pause-meeting.swagger';

@MeetingsController()
export class PauseMeetingAction {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly meetingsGateway: MeetingsGateway,
  ) {}

  @Post(':id/pause')
  @PauseMeetingSwagger()
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingPauseProjection> {
    const result = await this.meetingService.pauseMeeting(id, user.userId);
    this.meetingsGateway.notifyPaused(id);
    this.meetingsGateway.stopCostCalculation(id);
    this.meetingsGateway.broadcastToMeeting(id, 'meeting:pause', result);
    return result;
  }
}
