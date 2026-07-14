import { applyDecorators, Post, ApiResponse } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { MeetingDetailProjection } from 'src/meetings/domain/services/meeting.service';

export const StartMeetingSwagger = () =>
  applyDecorators(
    Post(),
    ApiOperation({ summary: 'Start a new meeting' }),
    ApiResponse({ status: 201, description: 'Meeting started successfully' }),
    ApiResponse({ status: 400, description: 'Already have an active meeting' }),
  );
