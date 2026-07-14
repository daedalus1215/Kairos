import { Injectable } from '@nestjs/common';
import { MeetingNote } from '../entities/meeting-note.entity';
import { MeetingNoteProjection } from '../projections/meeting-note.projection';

@Injectable()
export class MeetingNoteAssembler {
  apply = (note: MeetingNote): MeetingNoteProjection => ({
    id: note.id,
    meetingId: note.meetingId,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  });
}
