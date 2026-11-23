import type { UsersQuery } from '@/api/users.api';

export const userKeys = {
  all: ['admin', 'users'] as const,
  list: (query: UsersQuery) => [...userKeys.all, 'list', query] as const,
};
