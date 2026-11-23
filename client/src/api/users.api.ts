import type { Paginated, UserRole, UserWithStats } from '@/types/api';
import { http } from './http';

export interface UsersQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

export const usersApi = {
  list: (query: UsersQuery) =>
    http.get<Paginated<UserWithStats>>('/admin/users', { params: query }).then((res) => res.data),

  create: (payload: CreateUserPayload) =>
    http.post<UserWithStats>('/admin/users', payload).then((res) => res.data),

  update: (id: string, payload: UpdateUserPayload) =>
    http.patch<UserWithStats>(`/admin/users/${id}`, payload).then((res) => res.data),

  remove: (id: string) => http.delete(`/admin/users/${id}`),
};
