import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService } from 'src/meetings/domain/services/meeting.service';
import { MeetingResponseDto } from 'src/meetings/apps/dtos/responses/meeting-response.dto';

@ApiTags('Meetings')
@Controller('meetings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GetActiveMeetingAction {
  constructor(private readonly meetingService: MeetingService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get the current active meeting' })
  @ApiResponse({ status: 200, description: 'Active meeting or null' })
  apply(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingResponseDto | null> {
    return this.meetingService.findActiveMeeting(user.userId);
  }
}
