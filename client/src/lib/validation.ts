import { z } from 'zod';

export const nameSchema = z.string().trim().min(2, 'Name must be at least 2 characters').max(100);
export const emailSchema = z.string().trim().pipe(z.email('Enter a valid email address'));
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

const httpUrlSchema = z
  .url({ protocol: /^https?$/, error: 'Enter a valid http(s) URL' })
  .max(2048, 'URL must be at most 2048 characters');

export function getHttpUrlError(value: string): string | null {
  const result = httpUrlSchema.safeParse(value);
  return result.success ? null : result.error.issues[0].message;
}

export function isHttpUrl(value: string): boolean {
  return getHttpUrlError(value) === null;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, WEBP and GIF images are allowed';
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) return 'Image must be at most 5 MB';
  return null;
}
