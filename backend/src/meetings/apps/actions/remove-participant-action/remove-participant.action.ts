import { Delete, Param, ParseIntPipe } from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService, MeetingParticipantProjection } from 'src/meetings/domain/services/meeting.service';
import { MeetingsGateway } from 'src/meetings/apps/gateways/meetings.gateway';
import { MeetingsController } from 'src/meetings/apps/controllers/meetings.controller';
import { RemoveParticipantSwagger } from './remove-participant.swagger';

@MeetingsController()
export class RemoveParticipantAction {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly meetingsGateway: MeetingsGateway,
  ) {}

  @Delete(':id/participants/:participantId')
  @RemoveParticipantSwagger()
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @Param('participantId', ParseIntPipe) participantId: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingParticipantProjection> {
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
