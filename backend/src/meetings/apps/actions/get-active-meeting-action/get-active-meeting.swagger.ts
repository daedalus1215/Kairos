import { applyDecorators, Get, ApiResponse } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const GetActiveMeetingSwagger = () =>
  applyDecorators(
    Get('active'),
    ApiOperation({ summary: 'Get the current active meeting' }),
    ApiResponse({ status: 200, description: 'Active meeting or null' }),
  );
