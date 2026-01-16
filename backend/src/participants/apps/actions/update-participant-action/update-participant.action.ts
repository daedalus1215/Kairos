import { Controller, Put, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { ParticipantService } from 'src/participants/domain/services/participant.service';
import { UpdateParticipantDto } from 'src/participants/apps/dtos/requests/update-participant.dto';
import { ParticipantResponseDto } from 'src/participants/apps/dtos/responses/participant-response.dto';

@ApiTags('Participants')
@Controller('participants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UpdateParticipantAction {
  constructor(private readonly participantService: ParticipantService) {}

  @Put(':id')
  @ApiOperation({ summary: 'Update a participant' })
  @ApiResponse({ status: 200, description: 'Participant updated successfully' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  apply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateParticipantDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ParticipantResponseDto> {
    return this.participantService.update(id, dto, user.userId);
  }
}
