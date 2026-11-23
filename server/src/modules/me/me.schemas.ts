import { z } from 'zod';
import { emailSchema, nameSchema } from '../../utils/validation.js';

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),

  removeAvatar: z.stringbool().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
