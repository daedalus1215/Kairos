import { applyDecorators, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const GetActiveMeetingSwagger = () =>
  applyDecorators(
    Get('active'),
    ApiOperation({ summary: 'Get the current active meeting' }),
    ApiResponse({ status: 200, description: 'Active meeting or null' }),
  );
