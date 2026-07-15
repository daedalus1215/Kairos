import { applyDecorators, Post, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const AddParticipantSwagger = () =>
  applyDecorators(
    Post(':id/participants'),
    ApiOperation({ summary: 'Add a participant to a meeting' }),
    ApiResponse({ status: 201, description: 'Participant added successfully' }),
    ApiResponse({ status: 404, description: 'Meeting or participant not found' }),
  );
