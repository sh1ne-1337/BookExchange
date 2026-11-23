import { z } from 'zod';

export const idParamsSchema = z.object({ id: z.uuid('Invalid id') });

export const nameSchema = z.string().trim().min(2, 'Name must be at least 2 characters').max(100);

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email('Invalid email address'));

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

export const httpUrlSchema = z
  .url({ protocol: /^https?$/, error: 'Must be a valid http(s) URL' })
  .max(2048, 'URL must be at most 2048 characters');

export const searchSchema = z.string().trim().max(100).optional();

export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}
