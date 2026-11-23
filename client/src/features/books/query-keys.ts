import type { BooksQuery } from '@/api/books.api';

export const bookKeys = {
  all: ['books'] as const,
  list: (query: BooksQuery) => [...bookKeys.all, 'list', query] as const,
  detail: (id: string) => [...bookKeys.all, 'detail', id] as const,
  mine: () => [...bookKeys.all, 'mine'] as const,
};
