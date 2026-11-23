import { z } from 'zod';
import { UserRole } from '../../entities/user.entity.js';
import { paginationSchema } from '../../utils/pagination.js';
import { emailSchema, nameSchema, passwordSchema, searchSchema } from '../../utils/validation.js';

const roleSchema = z.enum(UserRole);

export const listUsersQuerySchema = paginationSchema.extend({ search: searchSchema });

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema.default(UserRole.User),
});

export const updateUserSchema = z
  .object({ name: nameSchema, email: emailSchema, password: passwordSchema, role: roleSchema })
  .partial();

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export type CreateUserInput = z.input<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
