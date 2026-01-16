import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
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
export class GetMeetingAction {
  constructor(private readonly meetingService: MeetingService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a meeting by ID' })
  @ApiResponse({ status: 200, description: 'Meeting found' })
  @ApiResponse({ status: 404, description: 'Meeting not found' })
  apply(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingResponseDto> {
    return this.meetingService.findOne(id, user.userId);
  }
}
