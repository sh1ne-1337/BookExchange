import type { Request, Response } from 'express';
import { getAuthUser } from '../../middlewares/authenticate.js';
import { toUserDto } from '../users/users.mapper.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schemas.js';
import * as authService from './auth.service.js';
import * as passwordResetService from './password-reset.service.js';

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  res.status(201).json(await authService.register(input));
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  res.json(await authService.login(input));
}

export function me(req: Request, res: Response) {
  res.json(toUserDto(getAuthUser(req)));
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = forgotPasswordSchema.parse(req.body);
  await passwordResetService.requestPasswordReset(email);
  res.json({ message: 'If an account with this email exists, a reset link has been sent' });
}

export async function resetPassword(req: Request, res: Response) {
  const input = resetPasswordSchema.parse(req.body);
  await passwordResetService.resetPassword(input);
  res.json({ message: 'Password has been reset' });
}
