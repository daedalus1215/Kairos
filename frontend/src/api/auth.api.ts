import { api } from './axios';
import type { AuthResponse, User } from './types';

export const authApi = {
  register: async (
    email: string,
    password: string,
    defaultHourlyRate?: number
  ): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      defaultHourlyRate,
    });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};
