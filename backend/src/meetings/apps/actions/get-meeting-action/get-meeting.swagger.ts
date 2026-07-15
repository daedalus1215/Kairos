import { applyDecorators, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const GetMeetingSwagger = () =>
  applyDecorators(
    Get(':id'),
    ApiOperation({ summary: 'Get a meeting by ID' }),
    ApiResponse({ status: 200, description: 'Meeting found' }),
    ApiResponse({ status: 404, description: 'Meeting not found' }),
  );
