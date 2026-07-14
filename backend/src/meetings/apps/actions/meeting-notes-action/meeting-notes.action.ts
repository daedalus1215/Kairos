import {
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { MeetingService, MeetingNoteProjection } from 'src/meetings/domain/services/meeting.service';
import { CreateMeetingNoteDto } from 'src/meetings/apps/dtos/requests/create-meeting-note.dto';
import {
  MeetingNotesController,
  GetNotesSwagger,
  AddNoteSwagger,
  UpdateNoteSwagger,
  DeleteNoteSwagger,
} from './meeting-notes.swagger';

@MeetingNotesController()
export class MeetingNotesAction {
  constructor(private readonly meetingService: MeetingService) {}

  @Get()
  @GetNotesSwagger()
  getNotes(
    @Param('meetingId', ParseIntPipe) meetingId: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingNoteProjection[]> {
    return this.meetingService.getNotes(meetingId, user.userId);
  }

  @Post()
  @AddNoteSwagger()
  addNote(
    @Param('meetingId', ParseIntPipe) meetingId: number,
    @Body() dto: CreateMeetingNoteDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingNoteProjection> {
    return this.meetingService.addNote(meetingId, dto.content, user.userId);
  }

  @Put(':noteId')
  @UpdateNoteSwagger()
  updateNote(
    @Param('meetingId', ParseIntPipe) meetingId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
    @Body() dto: CreateMeetingNoteDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MeetingNoteProjection> {
    return this.meetingService.updateNote(meetingId, noteId, dto.content, user.userId);
  }

  @Delete(':noteId')
  @DeleteNoteSwagger()
  deleteNote(
    @Param('meetingId', ParseIntPipe) meetingId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    return this.meetingService.deleteNote(meetingId, noteId, user.userId);
  }
}
