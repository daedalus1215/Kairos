import { applyDecorators, Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';

export const MeetingsController = () =>
  applyDecorators(
    Controller('meetings'),
    ApiTags('Meetings'),
    ApiBearerAuth('JWT-auth'),
    UseGuards(JwtAuthGuard),
  );
