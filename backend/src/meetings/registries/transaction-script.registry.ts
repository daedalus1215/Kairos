import { StartMeetingTransactionScript } from '../domain/transaction-scripts/start-meeting-ts/start-meeting.transaction.script';
import { EndMeetingTransactionScript } from '../domain/transaction-scripts/end-meeting-ts/end-meeting.transaction.script';
import { PauseMeetingTransactionScript } from '../domain/transaction-scripts/pause-meeting-ts/pause-meeting.transaction.script';
import { ResumeMeetingTransactionScript } from '../domain/transaction-scripts/resume-meeting-ts/resume-meeting.transaction.script';
import { AddParticipantToMeetingTransactionScript } from '../domain/transaction-scripts/add-participant-to-meeting-ts/add-participant-to-meeting.transaction.script';
import { RemoveParticipantFromMeetingTransactionScript } from '../domain/transaction-scripts/remove-participant-from-meeting-ts/remove-participant-from-meeting.transaction.script';
import { CalculateMeetingCostTransactionScript } from '../domain/transaction-scripts/calculate-meeting-cost-ts/calculate-meeting-cost.transaction.script';
import { FetchMeetingTransactionScript } from '../domain/transaction-scripts/fetch-meeting-ts/fetch-meeting.transaction.script';
import { FetchAllMeetingsTransactionScript } from '../domain/transaction-scripts/fetch-all-meetings-ts/fetch-all-meetings.transaction.script';
import { FetchActiveMeetingTransactionScript } from '../domain/transaction-scripts/fetch-active-meeting-ts/fetch-active-meeting.transaction.script';
import { SearchMeetingsTransactionScript } from '../domain/transaction-scripts/search-meetings-ts/search-meetings.transaction.script';
import { AddMeetingNoteTransactionScript } from '../domain/transaction-scripts/add-meeting-note-ts/add-meeting-note.transaction.script';
import { GetMeetingNotesTransactionScript } from '../domain/transaction-scripts/get-meeting-notes-ts/get-meeting-notes.transaction.script';
import { UpdateMeetingNoteTransactionScript } from '../domain/transaction-scripts/update-meeting-note-ts/update-meeting-note.transaction.script';
import { DeleteMeetingNoteTransactionScript } from '../domain/transaction-scripts/delete-meeting-note-ts/delete-meeting-note.transaction.script';

export const transactionScriptRegistry = [
  StartMeetingTransactionScript,
  EndMeetingTransactionScript,
  PauseMeetingTransactionScript,
  ResumeMeetingTransactionScript,
  AddParticipantToMeetingTransactionScript,
  RemoveParticipantFromMeetingTransactionScript,
  CalculateMeetingCostTransactionScript,
  FetchMeetingTransactionScript,
  FetchAllMeetingsTransactionScript,
  FetchActiveMeetingTransactionScript,
  SearchMeetingsTransactionScript,
  AddMeetingNoteTransactionScript,
  GetMeetingNotesTransactionScript,
  UpdateMeetingNoteTransactionScript,
  DeleteMeetingNoteTransactionScript,
];
