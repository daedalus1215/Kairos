import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { ParticipantService } from 'src/participants/domain/services/participant.service';
import { CreateParticipantDto } from 'src/participants/apps/dtos/requests/create-participant.dto';
import { ParticipantResponseDto } from 'src/participants/apps/dtos/responses/participant-response.dto';

@ApiTags('Participants')
@Controller('participants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CreateParticipantAction {
  constructor(private readonly participantService: ParticipantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new participant' })
  @ApiResponse({ status: 201, description: 'Participant created successfully' })
  apply(
    @Body() dto: CreateParticipantDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ParticipantResponseDto> {
    return this.participantService.create(dto, user.userId);
  }
}
