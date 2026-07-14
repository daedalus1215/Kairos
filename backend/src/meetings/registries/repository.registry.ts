import { MeetingRepository } from '../infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from '../infra/repositories/meeting-participant.repository';
import { MeetingNoteRepository } from '../infra/repositories/meeting-note.repository';

export const repositoryRegistry = [
  MeetingRepository,
  MeetingParticipantRepository,
  MeetingNoteRepository,
];
