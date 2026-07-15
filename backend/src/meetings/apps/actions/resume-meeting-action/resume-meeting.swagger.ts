import { applyDecorators, Post, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ResumeMeetingSwagger = () =>
  applyDecorators(
    Post(':id/resume'),
    ApiOperation({ summary: 'Resume a meeting' }),
    ApiResponse({ status: 200, description: 'Meeting resumed successfully' }),
    ApiResponse({ status: 400, description: 'Meeting is not paused or not active' }),
    ApiResponse({ status: 404, description: 'Meeting not found' }),
  );
