import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
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
export class SearchMeetingsAction {
  constructor(private readonly meetingService: MeetingService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search meetings by title' })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Search results' })
  apply(
    @CurrentUser() user: CurrentUserPayload,
    @Query('q') searchTerm: string,
  ): Promise<MeetingResponseDto[]> {
    return this.meetingService.search(user.userId, searchTerm || '');
  }
}
