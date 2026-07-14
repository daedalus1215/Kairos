export interface UpdateMeetingNoteCommand {
  meetingId: number;
  noteId: number;
  userId: number;
  content: string;
}
