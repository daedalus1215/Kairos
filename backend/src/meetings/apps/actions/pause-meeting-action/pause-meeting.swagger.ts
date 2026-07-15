import { applyDecorators, Post, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const PauseMeetingSwagger = () =>
  applyDecorators(
    Post(':id/pause'),
    ApiOperation({ summary: 'Pause a meeting' }),
    ApiResponse({ status: 200, description: 'Meeting paused successfully' }),
    ApiResponse({ status: 400, description: 'Meeting is already paused or not active' }),
    ApiResponse({ status: 404, description: 'Meeting not found' }),
  );
