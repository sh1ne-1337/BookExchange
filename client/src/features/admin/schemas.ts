import { z } from 'zod';
import { emailSchema, nameSchema, passwordSchema } from '@/lib/validation';
import { USER_ROLES } from '@/types/api';

export const createUserFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(USER_ROLES),
});

export const editUserFormSchema = createUserFormSchema.extend({
  password: z.union([z.literal(''), passwordSchema]),
});

export type UserFormValues = z.infer<typeof createUserFormSchema>;
