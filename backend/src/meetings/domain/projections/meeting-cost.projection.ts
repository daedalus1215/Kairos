export type MeetingCostProjection = {
  meetingId: number;
  totalCost: number;
  elapsedSeconds: number;
  participants: {
    participantId: number;
    costContribution: number;
  }[];
};
