import { Injectable } from '@nestjs/common';

import { StartMeetingTransactionScript } from '../transaction-scripts/start-meeting-ts/start-meeting.transaction.script';
import { EndMeetingTransactionScript } from '../transaction-scripts/end-meeting-ts/end-meeting.transaction.script';
import { PauseMeetingTransactionScript } from '../transaction-scripts/pause-meeting-ts/pause-meeting.transaction.script';
import { ResumeMeetingTransactionScript } from '../transaction-scripts/resume-meeting-ts/resume-meeting.transaction.script';
import { AddParticipantToMeetingTransactionScript } from '../transaction-scripts/add-participant-to-meeting-ts/add-participant-to-meeting.transaction.script';
import { RemoveParticipantFromMeetingTransactionScript } from '../transaction-scripts/remove-participant-from-meeting-ts/remove-participant-from-meeting.transaction.script';
import { CalculateMeetingCostTransactionScript } from '../transaction-scripts/calculate-meeting-cost-ts/calculate-meeting-cost.transaction.script';
import { FetchMeetingTransactionScript } from '../transaction-scripts/fetch-meeting-ts/fetch-meeting.transaction.script';
import { FetchAllMeetingsTransactionScript } from '../transaction-scripts/fetch-all-meetings-ts/fetch-all-meetings.transaction.script';
import { FetchActiveMeetingTransactionScript } from '../transaction-scripts/fetch-active-meeting-ts/fetch-active-meeting.transaction.script';
import { SearchMeetingsTransactionScript } from '../transaction-scripts/search-meetings-ts/search-meetings.transaction.script';
import { AddMeetingNoteTransactionScript } from '../transaction-scripts/add-meeting-note-ts/add-meeting-note.transaction.script';
import { GetMeetingNotesTransactionScript } from '../transaction-scripts/get-meeting-notes-ts/get-meeting-notes.transaction.script';
import { UpdateMeetingNoteTransactionScript } from '../transaction-scripts/update-meeting-note-ts/update-meeting-note.transaction.script';
import { DeleteMeetingNoteTransactionScript } from '../transaction-scripts/delete-meeting-note-ts/delete-meeting-note.transaction.script';

import { StartMeetingCommand } from '../commands/start-meeting.command';
import { AddParticipantToMeetingCommand } from '../commands/add-participant-to-meeting.command';
import { AddMeetingNoteCommand } from '../commands/add-meeting-note.command';
import { UpdateMeetingNoteCommand } from '../commands/update-meeting-note.command';
import { DeleteMeetingNoteCommand } from '../commands/delete-meeting-note.command';
import { PendingParticipant } from '../commands/resume-meeting.command';

import { MeetingDetailProjection } from '../projections/meeting-detail.projection';
import { MeetingParticipantProjection } from '../projections/meeting-detail.projection';
import { MeetingPauseProjection } from '../projections/meeting-pause.projection';
import { MeetingResumeProjection } from '../projections/meeting-resume.projection';
import { MeetingCostProjection } from '../projections/meeting-cost.projection';
import { MeetingNoteProjection } from '../projections/meeting-note.projection';

import { MeetingResponseMapper } from '../mappers/meeting-response.mapper';
import { MeetingParticipantAssembler } from '../assemblers/meeting-participant.assembler';
import { MeetingNoteAssembler } from '../assemblers/meeting-note.assembler';

@Injectable()
export class MeetingService {
  constructor(
    // Transaction scripts
    private readonly startMeetingTS: StartMeetingTransactionScript,
    private readonly endMeetingTS: EndMeetingTransactionScript,
    private readonly pauseMeetingTS: PauseMeetingTransactionScript,
    private readonly resumeMeetingTS: ResumeMeetingTransactionScript,
    private readonly addParticipantTS: AddParticipantToMeetingTransactionScript,
    private readonly removeParticipantTS: RemoveParticipantFromMeetingTransactionScript,
    private readonly calculateCostTS: CalculateMeetingCostTransactionScript,
    private readonly fetchMeetingTS: FetchMeetingTransactionScript,
    private readonly fetchAllMeetingsTS: FetchAllMeetingsTransactionScript,
    private readonly fetchActiveMeetingTS: FetchActiveMeetingTransactionScript,
    private readonly searchMeetingsTS: SearchMeetingsTransactionScript,
    private readonly addNoteTS: AddMeetingNoteTransactionScript,
    private readonly getNotesTS: GetMeetingNotesTransactionScript,
    private readonly updateNoteTS: UpdateMeetingNoteTransactionScript,
    private readonly deleteNoteTS: DeleteMeetingNoteTransactionScript,
    // Mappers / Assemblers
    private readonly meetingResponseMapper: MeetingResponseMapper,
    private readonly meetingParticipantAssembler: MeetingParticipantAssembler,
    private readonly meetingNoteAssembler: MeetingNoteAssembler,
  ) {}

  // --- Lifecycle ---

  startMeeting = async (
    command: StartMeetingCommand,
    userId: number,
  ): Promise<MeetingDetailProjection> => {
    const meeting = await this.startMeetingTS.apply(command, userId);
    return this.meetingResponseMapper.apply(meeting);
  };

  endMeeting = async (
    meetingId: number,
    userId: number,
  ): Promise<MeetingDetailProjection> => {
    const meeting = await this.endMeetingTS.apply({ meetingId, userId });
    return this.meetingResponseMapper.apply(meeting);
  };

  pauseMeeting = async (
    meetingId: number,
    userId: number,
  ): Promise<MeetingPauseProjection> => {
    return this.pauseMeetingTS.apply({ meetingId, userId });
  };

  resumeMeeting = async (
    meetingId: number,
    userId: number,
    pendingParticipants: PendingParticipant[] = [],
  ): Promise<MeetingResumeProjection> => {
    return this.resumeMeetingTS.apply({ meetingId, userId, pendingParticipants });
  };

  calculateCost = async (
    meetingId: number,
  ): Promise<MeetingCostProjection | null> => {
    return this.calculateCostTS.apply(meetingId);
  };

  // --- Participants ---

  addParticipant = async (
    meetingId: number,
    participantId: number,
    userId: number,
    rateOverride?: number | null,
  ): Promise<MeetingParticipantProjection> => {
    const mp = await this.addParticipantTS.apply({
      meetingId,
      participantId,
      userId,
      rateOverride,
    });
    return this.meetingParticipantAssembler.apply(mp);
  };

  removeParticipant = async (
    meetingId: number,
    participantId: number,
    userId: number,
  ): Promise<MeetingParticipantProjection> => {
    const mp = await this.removeParticipantTS.apply({ meetingId, participantId, userId });
    return this.meetingParticipantAssembler.apply(mp);
  };

  // --- Queries ---

  findOne = async (
    meetingId: number,
    userId: number,
  ): Promise<MeetingDetailProjection> => {
    const meeting = await this.fetchMeetingTS.apply({ meetingId, userId });
    return this.meetingResponseMapper.apply(meeting);
  };

  findAll = async (
    userId: number,
    options?: { status?: string; limit?: number; offset?: number },
  ): Promise<MeetingDetailProjection[]> => {
    const meetings = await this.fetchAllMeetingsTS.apply({ userId, options });
    return Promise.all(meetings.map(m => this.meetingResponseMapper.apply(m)));
  };

  findActiveMeeting = async (
    userId: number,
  ): Promise<MeetingDetailProjection | null> => {
    const meeting = await this.fetchActiveMeetingTS.apply(userId);
    if (!meeting) return null;
    return this.meetingResponseMapper.apply(meeting);
  };

  search = async (
    userId: number,
    searchTerm: string,
  ): Promise<MeetingDetailProjection[]> => {
    const meetings = await this.searchMeetingsTS.apply({ userId, searchTerm });
    return Promise.all(meetings.map(m => this.meetingResponseMapper.apply(m)));
  };

  // --- Notes ---

  addNote = async (
    meetingId: number,
    content: string,
    userId: number,
  ): Promise<MeetingNoteProjection> => {
    const note = await this.addNoteTS.apply({ meetingId, userId, content });
    return this.meetingNoteAssembler.apply(note);
  };

  getNotes = async (
    meetingId: number,
    userId: number,
  ): Promise<MeetingNoteProjection[]> => {
    const notes = await this.getNotesTS.apply(meetingId, userId);
    return notes.map(n => this.meetingNoteAssembler.apply(n));
  };

  updateNote = async (
    meetingId: number,
    noteId: number,
    content: string,
    userId: number,
  ): Promise<MeetingNoteProjection> => {
    const note = await this.updateNoteTS.apply({ meetingId, noteId, userId, content });
    return this.meetingNoteAssembler.apply(note);
  };

  deleteNote = async (
    meetingId: number,
    noteId: number,
    userId: number,
  ): Promise<void> => {
    await this.deleteNoteTS.apply({ meetingId, noteId, userId });
  };
}

// Re-export projection types so Actions can use them
export { MeetingDetailProjection, MeetingParticipantProjection } from '../projections/meeting-detail.projection';
export { MeetingPauseProjection } from '../projections/meeting-pause.projection';
export { MeetingResumeProjection } from '../projections/meeting-resume.projection';
export { MeetingCostProjection } from '../projections/meeting-cost.projection';
export { MeetingNoteProjection } from '../projections/meeting-note.projection';
export { PendingParticipantProjection } from '../projections/pending-participant.projection';
