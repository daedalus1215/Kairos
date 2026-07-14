export type MeetingPauseProjection = {
  meetingId: number;
  pausedAt: Date;
  totalPausedSeconds: number;
  totalCost: number;
  elapsedSeconds: number;
};
