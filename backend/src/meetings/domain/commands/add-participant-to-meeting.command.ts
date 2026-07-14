export interface AddParticipantToMeetingCommand {
  meetingId: number;
  participantId: number;
  userId: number;
  rateOverride?: number | null;
}
