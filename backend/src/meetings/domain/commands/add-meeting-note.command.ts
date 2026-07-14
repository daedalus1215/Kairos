export interface AddMeetingNoteCommand {
  meetingId: number;
  userId: number;
  content: string;
}
