import { z } from 'zod';
import { getHttpUrlError, validateImageFile } from '@/lib/validation';

const PHOTO_SOURCES = ['upload', 'url'] as const;
export type PhotoSource = (typeof PHOTO_SOURCES)[number];

export const bookFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Title is required').max(200),
    author: z.string().trim().min(1, 'Author is required').max(200),
    photoSource: z.enum(PHOTO_SOURCES),
    photoUrl: z.string().trim(),
    photo: z.instanceof(File).optional(),
  })
  .superRefine(({ photoSource, photoUrl, photo }, context) => {
    const photoUrlError = photoSource === 'url' && photoUrl ? getHttpUrlError(photoUrl) : null;
    if (photoUrlError) {
      context.addIssue({ code: 'custom', path: ['photoUrl'], message: photoUrlError });
    }
    const photoError = photoSource === 'upload' && photo && validateImageFile(photo);
    if (photoError) {
      context.addIssue({ code: 'custom', path: ['photo'], message: photoError });
    }
  });

export type BookFormValues = z.infer<typeof bookFormSchema>;
