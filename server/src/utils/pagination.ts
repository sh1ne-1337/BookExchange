import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export interface Paginated<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function getOffset({ page, limit }: PaginationParams): number {
  return (page - 1) * limit;
}

export function toPaginated<T>(
  items: T[],
  total: number,
  { page, limit }: PaginationParams,
): Paginated<T> {
  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
