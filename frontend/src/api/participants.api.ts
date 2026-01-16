import { api } from './axios';
import type { Participant, CreateParticipantDto, UpdateParticipantDto } from './types';

export const participantsApi = {
  getAll: async (): Promise<Participant[]> => {
    const { data } = await api.get<Participant[]>('/participants');
    return data;
  },

  getOne: async (id: number): Promise<Participant> => {
    const { data } = await api.get<Participant>(`/participants/${id}`);
    return data;
  },

  create: async (dto: CreateParticipantDto): Promise<Participant> => {
    const { data } = await api.post<Participant>('/participants', dto);
    return data;
  },

  update: async (id: number, dto: UpdateParticipantDto): Promise<Participant> => {
    const { data } = await api.put<Participant>(`/participants/${id}`, dto);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/participants/${id}`);
  },
};
