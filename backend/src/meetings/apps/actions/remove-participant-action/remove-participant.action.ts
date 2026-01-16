import { Controller, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService } from 'src/meetings/domain/services/meeting.service';
import { MeetingsGateway } from 'src/meetings/apps/gateways/meetings.gateway';
import { MeetingParticipantResponseDto } from 'src/meetings/apps/dtos/responses/meeting-response.dto';

@ApiTags('Meetings')
@Controller('meetings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RemoveParticipantAction {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly meetingsGateway: MeetingsGateway,
  ) {}

  @Delete(':id/participants/:participantId')
  @ApiOperation({ summary: 'Remove a participant from a meeting' })
  @ApiResponse({ status: 200, description: 'Participant removed successfully' })
  @ApiResponse({ status: 404, description: 'Meeting or participant not found' })
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @Param('participantId', ParseIntPipe) participantId: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingParticipantResponseDto> {
    const participant = await this.meetingService.removeParticipant(
      id,
      participantId,
      user.userId,
    );
    this.meetingsGateway.broadcastToMeeting(
      id,
      'meeting:participant:remove',
      participant,
    );
    return participant;
  }
}
