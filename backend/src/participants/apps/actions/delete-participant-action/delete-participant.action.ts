import { Controller, Delete, Param, ParseIntPipe, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { ParticipantService } from 'src/participants/domain/services/participant.service';

@ApiTags('Participants')
@Controller('participants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DeleteParticipantAction {
  constructor(private readonly participantService: ParticipantService) {}

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a participant' })
  @ApiResponse({ status: 204, description: 'Participant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  apply(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    return this.participantService.delete(id, user.userId);
  }
}
