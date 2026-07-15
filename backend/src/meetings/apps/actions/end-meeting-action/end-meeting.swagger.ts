import { applyDecorators, Post, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const EndMeetingSwagger = () =>
  applyDecorators(
    Post(':id/end'),
    ApiOperation({ summary: 'End a meeting' }),
    ApiResponse({ status: 200, description: 'Meeting ended successfully' }),
    ApiResponse({ status: 404, description: 'Meeting not found' }),
  );
