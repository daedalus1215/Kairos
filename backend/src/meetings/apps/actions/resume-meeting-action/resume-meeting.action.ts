import { Post, Param, ParseIntPipe } from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService, MeetingResumeProjection } from 'src/meetings/domain/services/meeting.service';
import { MeetingsGateway } from 'src/meetings/apps/gateways/meetings.gateway';
import { MeetingsController } from 'src/meetings/apps/controllers/meetings.controller';
import { ResumeMeetingSwagger } from './resume-meeting.swagger';

@MeetingsController()
export class ResumeMeetingAction {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly meetingsGateway: MeetingsGateway,
  ) {}

  @Post(':id/resume')
  @ResumeMeetingSwagger()
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingResumeProjection> {
    const pending = this.meetingsGateway.getPendingParticipants(id) || [];
    const result = await this.meetingService.resumeMeeting(id, user.userId, pending);
    this.meetingsGateway.notifyResumed(id);
    this.meetingsGateway.startCostCalculation(id);
    this.meetingsGateway.broadcastToMeeting(id, 'meeting:resume', result);
    return result;
  }
}
