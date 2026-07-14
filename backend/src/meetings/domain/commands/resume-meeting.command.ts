export interface ResumeMeetingParams {
  meetingId: number;
  userId: number;
  pendingParticipants?: PendingParticipant[];
}

export interface PendingParticipant {
  participantId: number;
  participantName: string;
  participantRole: string | null;
  participantColor: string;
  hourlyRate: number;
}
