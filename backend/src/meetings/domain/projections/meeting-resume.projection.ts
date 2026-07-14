export type MeetingResumeProjection = {
  meetingId: number;
  resumedAt: Date;
  totalPausedSeconds: number;
  totalCost: number;
  elapsedSeconds: number;
};
