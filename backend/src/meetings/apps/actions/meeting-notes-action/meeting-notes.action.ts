import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService } from 'src/meetings/domain/services/meeting.service';
import { CreateMeetingNoteDto } from 'src/meetings/apps/dtos/requests/create-meeting-note.dto';
import { MeetingNoteResponseDto } from 'src/meetings/apps/dtos/responses/meeting-response.dto';

@ApiTags('Meeting Notes')
@Controller('meetings/:meetingId/notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeetingNotesAction {
  constructor(private readonly meetingService: MeetingService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notes for a meeting' })
  @ApiResponse({ status: 200, description: 'List of notes' })
  getNotes(
    @Param('meetingId', ParseIntPipe) meetingId: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingNoteResponseDto[]> {
    return this.meetingService.getNotes(meetingId, user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a note to a meeting' })
  @ApiResponse({ status: 201, description: 'Note added successfully' })
  addNote(
    @Param('meetingId', ParseIntPipe) meetingId: number,
    @Body() dto: CreateMeetingNoteDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingNoteResponseDto> {
    return this.meetingService.addNote(meetingId, dto, user.userId);
  }

  @Put(':noteId')
  @ApiOperation({ summary: 'Update a note' })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  updateNote(
    @Param('meetingId', ParseIntPipe) meetingId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
    @Body() dto: CreateMeetingNoteDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingNoteResponseDto> {
    return this.meetingService.updateNote(meetingId, noteId, dto, user.userId);
  }

  @Delete(':noteId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a note' })
  @ApiResponse({ status: 204, description: 'Note deleted successfully' })
  deleteNote(
    @Param('meetingId', ParseIntPipe) meetingId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    return this.meetingService.deleteNote(meetingId, noteId, user.userId);
  }
}
