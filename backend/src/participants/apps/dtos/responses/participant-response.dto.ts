export type ParticipantResponseDto = {
  id: number;
  name: string;
  role: string | null;
  hourlyRate: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ParticipantsListResponseDto = {
  participants: ParticipantResponseDto[];
};
