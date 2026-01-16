import { Controller, Post, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService } from 'src/meetings/domain/services/meeting.service';
import { MeetingsGateway } from 'src/meetings/apps/gateways/meetings.gateway';
import { MeetingResponseDto } from 'src/meetings/apps/dtos/responses/meeting-response.dto';

@ApiTags('Meetings')
@Controller('meetings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EndMeetingAction {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly meetingsGateway: MeetingsGateway,
  ) {}

  @Post(':id/end')
  @ApiOperation({ summary: 'End a meeting' })
  @ApiResponse({ status: 200, description: 'Meeting ended successfully' })
  @ApiResponse({ status: 404, description: 'Meeting not found' })
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingResponseDto> {
    const meeting = await this.meetingService.endMeeting(id, user.userId);
    this.meetingsGateway.broadcastToMeeting(id, 'meeting:end', meeting);
    this.meetingsGateway.stopCostCalculation(id);
    return meeting;
  }
}
