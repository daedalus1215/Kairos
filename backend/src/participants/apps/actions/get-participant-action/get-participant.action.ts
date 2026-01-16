import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
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
export class GetParticipantAction {
  constructor(private readonly participantService: ParticipantService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a participant by ID' })
  @ApiResponse({ status: 200, description: 'Participant found' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  apply(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ParticipantResponseDto> {
    return this.participantService.findOne(id, user.userId);
  }
}
