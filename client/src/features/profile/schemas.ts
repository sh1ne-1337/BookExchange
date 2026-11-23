import { z } from 'zod';
import { emailSchema, nameSchema, validateImageFile } from '@/lib/validation';

export const profileFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  avatar: z
    .instanceof(File)
    .optional()
    .superRefine((file, context) => {
      const error = file && validateImageFile(file);
      if (error) context.addIssue({ code: 'custom', message: error });
    }),
  removeAvatar: z.boolean(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
