import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { MeetingNoteRepository } from '../../../infra/repositories/meeting-note.repository';
import { MeetingNote } from '../../../domain/entities/meeting-note.entity';
import { UpdateMeetingNoteCommand } from '../../../domain/commands/update-meeting-note.command';

@Injectable()
export class UpdateMeetingNoteTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingNoteRepository: MeetingNoteRepository,
  ) {}

  apply = async (command: UpdateMeetingNoteCommand): Promise<MeetingNote> => {
    const meeting = await this.meetingRepository.findById(command.meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.userId !== command.userId) {
      throw new ForbiddenException('Access denied');
    }

    const note = await this.meetingNoteRepository.findById(command.noteId);
    if (!note || note.meetingId !== command.meetingId) {
      throw new NotFoundException('Note not found');
    }

    const updated = await this.meetingNoteRepository.update(command.noteId, {
      content: command.content,
    });
    if (!updated) {
      throw new NotFoundException('Failed to update note');
    }
    return updated;
  };
}
