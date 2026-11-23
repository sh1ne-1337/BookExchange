import { z } from 'zod';
import { paginationSchema } from '../../utils/pagination.js';
import { httpUrlSchema, searchSchema } from '../../utils/validation.js';

const BOOK_SORT_OPTIONS = ['name_asc', 'name_desc', 'author_asc', 'author_desc', 'newest'] as const;

export type BookSort = (typeof BOOK_SORT_OPTIONS)[number];

export const listBooksQuerySchema = paginationSchema.extend({
  search: searchSchema,
  sort: z.enum(BOOK_SORT_OPTIONS).default('name_asc'),
});

const photoUrlSchema = z.union([z.literal('').transform(() => null), httpUrlSchema]).optional();

export const bookSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  author: z.string().trim().min(1, 'Author is required').max(200),
  photoUrl: photoUrlSchema,
});

export type ListBooksQuery = z.infer<typeof listBooksQuerySchema>;
export type BookInput = z.infer<typeof bookSchema>;
