import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { ParticipantService } from 'src/participants/domain/services/participant.service';
import { ParticipantResponseDto } from 'src/participants/apps/dtos/responses/participant-response.dto';

@ApiTags('Participants')
@Controller('participants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GetParticipantsAction {
  constructor(private readonly participantService: ParticipantService) {}

  @Get()
  @ApiOperation({ summary: 'Get all participants for the current user' })
  @ApiResponse({ status: 200, description: 'List of participants' })
  apply(@CurrentUser() user: CurrentUserPayload): Promise<ParticipantResponseDto[]> {
    return this.participantService.findAll(user.userId);
  }
}
