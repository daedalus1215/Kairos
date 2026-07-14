export type User = {
  id: number;
  email: string;
  defaultHourlyRate: number;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type Participant = {
  id: number;
  name: string;
  role: string | null;
  hourlyRate: number;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type MeetingParticipant = {
  id: number;
  participantId: number;
  participantName: string;
  participantRole: string | null;
  participantColor: string;
  hourlyRate: number;
  joinedAt: string;
  leftAt: string | null;
  costContribution: number;
};

export type MeetingStatus = 'active' | 'ended' | 'cancelled';

export type Meeting = {
  id: number;
  title: string;
  startTime: string;
  endTime: string | null;
  totalCost: number;
  status: MeetingStatus;
  participants: MeetingParticipant[];
  pausedAt: string | null;
  totalPausedSeconds: number;
  createdAt: string;
};

export type PendingParticipant = {
  participantId: number;
  participantName: string;
  participantRole: string | null;
  participantColor: string;
  hourlyRate: number;
};

export type MeetingNote = {
  id: number;
  meetingId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type MeetingCostUpdate = {
  meetingId: number;
  totalCost: number;
  elapsedSeconds: number;
  participants: {
    participantId: number;
    costContribution: number;
  }[];
};

export type CreateParticipantDto = {
  name: string;
  role?: string;
  hourlyRate: number;
  color?: string;
};

export type UpdateParticipantDto = Partial<CreateParticipantDto>;

export type CreateMeetingDto = {
  title: string;
  participantIds?: number[];
};

export type AddParticipantDto = {
  participantId: number;
  rateOverride?: number;
};

export type CreateMeetingNoteDto = {
  content: string;
};
