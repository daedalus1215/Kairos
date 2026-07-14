import { MeetingStatus } from 'src/meetings/domain/entities/meeting.entity';

export type MeetingParticipantResponseDto = {
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

export type MeetingResponseDto = {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date | null;
  totalCost: number;
  status: MeetingStatus;
  participants: MeetingParticipantResponseDto[];
  pausedAt: Date | null;
  totalPausedSeconds: number;
  createdAt: Date;
};

export type MeetingPauseDto = {
  meetingId: number;
  pausedAt: Date;
  totalPausedSeconds: number;
  totalCost: number;
  elapsedSeconds: number;
};

export type MeetingResumeDto = {
  meetingId: number;
  resumedAt: Date;
  totalPausedSeconds: number;
  totalCost: number;
  elapsedSeconds: number;
};

export type MeetingPendingParticipantDto = {
  participantId: number;
  participantName: string;
  participantRole: string | null;
  participantColor: string;
  hourlyRate: number;
};

export type MeetingListResponseDto = {
  meetings: MeetingResponseDto[];
  total: number;
};

export type MeetingNoteResponseDto = {
  id: number;
  meetingId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MeetingCostUpdateDto = {
  meetingId: number;
  totalCost: number;
  elapsedSeconds: number;
  participants: {
    participantId: number;
    costContribution: number;
  }[];
};
