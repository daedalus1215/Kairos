import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService } from 'src/meetings/domain/services/meeting.service';
import { CreateMeetingDto } from 'src/meetings/apps/dtos/requests/create-meeting.dto';
import { MeetingResponseDto } from 'src/meetings/apps/dtos/responses/meeting-response.dto';

@ApiTags('Meetings')
@Controller('meetings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StartMeetingAction {
  constructor(private readonly meetingService: MeetingService) {}

  @Post()
  @ApiOperation({ summary: 'Start a new meeting' })
  @ApiResponse({ status: 201, description: 'Meeting started successfully' })
  @ApiResponse({ status: 400, description: 'Already have an active meeting' })
  apply(
    @Body() dto: CreateMeetingDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingResponseDto> {
    return this.meetingService.startMeeting(dto, user.userId);
  }
}
