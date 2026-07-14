import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { MeetingNoteRepository } from '../../../infra/repositories/meeting-note.repository';
import { DeleteMeetingNoteCommand } from '../../../domain/commands/delete-meeting-note.command';

@Injectable()
export class DeleteMeetingNoteTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingNoteRepository: MeetingNoteRepository,
  ) {}

  apply = async (command: DeleteMeetingNoteCommand): Promise<void> => {
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

    await this.meetingNoteRepository.delete(command.noteId);
  };
}
