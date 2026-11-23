import type { AuthResponse, User } from '@/types/api';
import { http } from './http';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    http.post<AuthResponse>('/auth/login', payload).then((res) => res.data),

  register: (payload: RegisterPayload) =>
    http.post<AuthResponse>('/auth/register', payload).then((res) => res.data),

  getMe: () => http.get<User>('/auth/me').then((res) => res.data),

  forgotPassword: (email: string) => http.post('/auth/forgot-password', { email }),

  resetPassword: (payload: ResetPasswordPayload) => http.post('/auth/reset-password', payload),
};
