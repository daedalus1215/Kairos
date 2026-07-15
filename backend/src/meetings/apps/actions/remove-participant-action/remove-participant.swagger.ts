import { applyDecorators, Delete, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const RemoveParticipantSwagger = () =>
  applyDecorators(
    Delete(':id/participants/:participantId'),
    ApiOperation({ summary: 'Remove a participant from a meeting' }),
    ApiResponse({ status: 200, description: 'Participant removed successfully' }),
    ApiResponse({ status: 404, description: 'Meeting or participant not found' }),
  );
