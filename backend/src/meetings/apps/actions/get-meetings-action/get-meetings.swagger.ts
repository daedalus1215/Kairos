import { applyDecorators, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

export const GetMeetingsSwagger = () =>
  applyDecorators(
    Get(),
    ApiOperation({ summary: 'Get all meetings for the current user' }),
    ApiQuery({ name: 'status', required: false, enum: ['active', 'ended', 'cancelled'] }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'offset', required: false, type: Number }),
    ApiResponse({ status: 200, description: 'List of meetings' }),
  );
