import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MeetingRepository } from '../../../infra/repositories/meeting.repository';
import { MeetingNoteRepository } from '../../../infra/repositories/meeting-note.repository';
import { MeetingNote } from '../../../domain/entities/meeting-note.entity';

@Injectable()
export class GetMeetingNotesTransactionScript {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingNoteRepository: MeetingNoteRepository,
  ) {}

  apply = async (meetingId: number, userId: number): Promise<MeetingNote[]> => {
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    if (meeting.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.meetingNoteRepository.findByMeetingId(meetingId);
  };
}
