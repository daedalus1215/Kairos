import { applyDecorators, Get, Post, Put, Delete, Param, Body, ParseIntPipe, HttpCode, Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';

export const MeetingNotesController = () =>
  applyDecorators(
    Controller('meetings/:meetingId/notes'),
    ApiTags('Meeting Notes'),
    ApiBearerAuth('JWT-auth'),
    UseGuards(JwtAuthGuard),
  );

export const GetNotesSwagger = () =>
  applyDecorators(
    Get(),
    ApiOperation({ summary: 'Get all notes for a meeting' }),
    ApiResponse({ status: 200, description: 'List of notes' }),
  );

export const AddNoteSwagger = () =>
  applyDecorators(
    Post(),
    ApiOperation({ summary: 'Add a note to a meeting' }),
    ApiResponse({ status: 201, description: 'Note added successfully' }),
  );

export const UpdateNoteSwagger = () =>
  applyDecorators(
    Put(':noteId'),
    ApiOperation({ summary: 'Update a note' }),
    ApiResponse({ status: 200, description: 'Note updated successfully' }),
  );

export const DeleteNoteSwagger = () =>
  applyDecorators(
    Delete(':noteId'),
    HttpCode(204),
    ApiOperation({ summary: 'Delete a note' }),
    ApiResponse({ status: 204, description: 'Note deleted successfully' }),
  );
