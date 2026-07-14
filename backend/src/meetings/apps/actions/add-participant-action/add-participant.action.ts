import { Post, Param, Body, ParseIntPipe, BadRequestException } from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService, MeetingParticipantProjection } from 'src/meetings/domain/services/meeting.service';
import { MeetingsGateway } from 'src/meetings/apps/gateways/meetings.gateway';
import { AddParticipantDto } from 'src/meetings/apps/dtos/requests/add-participant.dto';
import { MeetingsController } from 'src/meetings/apps/controllers/meetings.controller';
import { AddParticipantSwagger } from './add-participant.swagger';

@MeetingsController()
export class AddParticipantAction {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly meetingsGateway: MeetingsGateway,
  ) {}

  @Post(':id/participants')
  @AddParticipantSwagger()
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddParticipantDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingParticipantProjection> {
    const isPaused = await this.meetingsGateway.isMeetingPaused(id);
    if (isPaused) {
      await this.meetingsGateway.queuePendingParticipant(
        id,
        dto.participantId,
        user.userId,
      );
      throw new BadRequestException('Meeting is paused; participant queued as pending');
    }
    const participant = await this.meetingService.addParticipant(
      id,
      dto.participantId,
      user.userId,
      dto.rateOverride,
    );
    this.meetingsGateway.broadcastToMeeting(id, 'meeting:participant:add', participant);
    return participant;
  }
}
