import { Controller, Post, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService } from 'src/meetings/domain/services/meeting.service';
import { MeetingsGateway } from 'src/meetings/apps/gateways/meetings.gateway';
import { AddParticipantDto } from 'src/meetings/apps/dtos/requests/add-participant.dto';
import { MeetingParticipantResponseDto } from 'src/meetings/apps/dtos/responses/meeting-response.dto';

@ApiTags('Meetings')
@Controller('meetings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddParticipantAction {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly meetingsGateway: MeetingsGateway,
  ) {}

  @Post(':id/participants')
  @ApiOperation({ summary: 'Add a participant to a meeting' })
  @ApiResponse({ status: 201, description: 'Participant added successfully' })
  @ApiResponse({ status: 404, description: 'Meeting or participant not found' })
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddParticipantDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingParticipantResponseDto> {
    const participant = await this.meetingService.addParticipant(
      id,
      dto,
      user.userId,
    );
    this.meetingsGateway.broadcastToMeeting(id, 'meeting:participant:add', participant);
    return participant;
  }
}
