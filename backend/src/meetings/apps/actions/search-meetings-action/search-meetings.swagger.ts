import { applyDecorators, Get, ApiResponse, ApiQuery } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const SearchMeetingsSwagger = () =>
  applyDecorators(
    Get('search'),
    ApiOperation({ summary: 'Search meetings by title' }),
    ApiQuery({ name: 'q', required: true, description: 'Search term' }),
    ApiResponse({ status: 200, description: 'Search results' }),
  );
