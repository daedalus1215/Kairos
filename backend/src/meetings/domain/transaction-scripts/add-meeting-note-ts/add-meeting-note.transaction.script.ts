import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { MeetingNoteRepository } from '../../../infra/repositories/meeting-note.repository';
import { MeetingNote } from '../../../domain/entities/meeting-note.entity';
import { AddMeetingNoteCommand } from '../../../domain/commands/add-meeting-note.command';

@Injectable()
export class AddMeetingNoteTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingNoteRepository: MeetingNoteRepository,
  ) {}

  apply = async (command: AddMeetingNoteCommand): Promise<MeetingNote> => {
    const meeting = await this.meetingRepository.findById(command.meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.userId !== command.userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.meetingNoteRepository.create({
      meetingId: command.meetingId,
      content: command.content,
    });
  };
}
