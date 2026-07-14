import { api } from './axios';
import type {
  Meeting,
  MeetingNote,
  CreateMeetingDto,
  AddParticipantDto,
  CreateMeetingNoteDto,
  MeetingParticipant,
} from './types';

// Response types for pause/resume
type MeetingPauseResponse = {
  meetingId: number;
  pausedAt: string;
  totalPausedSeconds: number;
  totalCost: number;
  elapsedSeconds: number;
};

type MeetingResumeResponse = {
  meetingId: number;
  resumedAt: string;
  totalPausedSeconds: number;
  totalCost: number;
  elapsedSeconds: number;
};

export const meetingsApi = {
  getAll: async (options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Meeting[]> => {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    const { data } = await api.get<Meeting[]>(`/meetings?${params.toString()}`);
    return data;
  },

  getOne: async (id: number): Promise<Meeting> => {
    const { data } = await api.get<Meeting>(`/meetings/${id}`);
    return data;
  },

  getActive: async (): Promise<Meeting | null> => {
    const { data } = await api.get<Meeting | null>('/meetings/active');
    return data;
  },

  search: async (searchTerm: string): Promise<Meeting[]> => {
    const { data } = await api.get<Meeting[]>(
      `/meetings/search?q=${encodeURIComponent(searchTerm)}`
    );
    return data;
  },

  start: async (dto: CreateMeetingDto): Promise<Meeting> => {
    const { data } = await api.post<Meeting>('/meetings', dto);
    return data;
  },

  end: async (id: number): Promise<Meeting> => {
    const { data } = await api.post<Meeting>(`/meetings/${id}/end`);
    return data;
  },

  addParticipant: async (
    meetingId: number,
    dto: AddParticipantDto
  ): Promise<MeetingParticipant> => {
    const { data } = await api.post<MeetingParticipant>(
      `/meetings/${meetingId}/participants`,
      dto
    );
    return data;
  },

  removeParticipant: async (
    meetingId: number,
    participantId: number
  ): Promise<MeetingParticipant> => {
    const { data } = await api.delete<MeetingParticipant>(
      `/meetings/${meetingId}/participants/${participantId}`
    );
    return data;
  },

  // Notes
  getNotes: async (meetingId: number): Promise<MeetingNote[]> => {
    const { data } = await api.get<MeetingNote[]>(
      `/meetings/${meetingId}/notes`
    );
    return data;
  },

  addNote: async (
    meetingId: number,
    dto: CreateMeetingNoteDto
  ): Promise<MeetingNote> => {
    const { data } = await api.post<MeetingNote>(
      `/meetings/${meetingId}/notes`,
      dto
    );
    return data;
  },

  updateNote: async (
    meetingId: number,
    noteId: number,
    dto: CreateMeetingNoteDto
  ): Promise<MeetingNote> => {
    const { data } = await api.put<MeetingNote>(
      `/meetings/${meetingId}/notes/${noteId}`,
      dto
    );
    return data;
  },

  deleteNote: async (meetingId: number, noteId: number): Promise<void> => {
    await api.delete(`/meetings/${meetingId}/notes/${noteId}`);
  },

  pause: async (id: number): Promise<MeetingPauseResponse> => {
    const { data } = await api.post<MeetingPauseResponse>(`/meetings/${id}/pause`);
    return data;
  },

  resume: async (id: number): Promise<MeetingResumeResponse> => {
    const { data } = await api.post<MeetingResumeResponse>(`/meetings/${id}/resume`);
    return data;
  },
};
