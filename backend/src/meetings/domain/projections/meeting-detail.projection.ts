import { MeetingStatus } from '../entities/meeting.entity';

export type MeetingParticipantProjection = {
  id: number;
  participantId: number;
  participantName: string;
  participantRole: string | null;
  participantColor: string;
  hourlyRate: number;
  joinedAt: Date;
  leftAt: Date | null;
  costContribution: number;
};

export type MeetingDetailProjection = {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date | null;
  totalCost: number;
  status: MeetingStatus;
  participants: MeetingParticipantProjection[];
  pausedAt: Date | null;
  totalPausedSeconds: number;
  createdAt: Date;
};
