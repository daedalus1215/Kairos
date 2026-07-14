import { GetActiveMeetingAction } from '../apps/actions/get-active-meeting-action/get-active-meeting.action';
import { SearchMeetingsAction } from '../apps/actions/search-meetings-action/search-meetings.action';
import { StartMeetingAction } from '../apps/actions/start-meeting-action/start-meeting.action';
import { EndMeetingAction } from '../apps/actions/end-meeting-action/end-meeting.action';
import { PauseMeetingAction } from '../apps/actions/pause-meeting-action/pause-meeting.action';
import { ResumeMeetingAction } from '../apps/actions/resume-meeting-action/resume-meeting.action';
import { GetMeetingsAction } from '../apps/actions/get-meetings-action/get-meetings.action';
import { GetMeetingAction } from '../apps/actions/get-meeting-action/get-meeting.action';
import { AddParticipantAction } from '../apps/actions/add-participant-action/add-participant.action';
import { RemoveParticipantAction } from '../apps/actions/remove-participant-action/remove-participant.action';
import { MeetingNotesAction } from '../apps/actions/meeting-notes-action/meeting-notes.action';

// Routes with specific paths must come before parameterized routes
export const actionRegistry = [
  GetActiveMeetingAction,
  SearchMeetingsAction,
  StartMeetingAction,
  EndMeetingAction,
  PauseMeetingAction,
  ResumeMeetingAction,
  GetMeetingsAction,
  GetMeetingAction,
  AddParticipantAction,
  RemoveParticipantAction,
  MeetingNotesAction,
];
