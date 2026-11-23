import { createHash, randomBytes } from 'node:crypto';
import { MoreThan } from 'typeorm';
import { env } from '../../config/env.js';
import { AppDataSource } from '../../database/data-source.js';
import { User } from '../../entities/user.entity.js';
import { sendMail } from '../../lib/mailer.js';
import { HttpError } from '../../utils/http-error.js';
import { hashPassword } from '../../utils/password.js';
import type { ResetPasswordInput } from './auth.schemas.js';
import { buildPasswordResetEmail } from './password-reset.email.js';

const RESET_TOKEN_TTL_MINUTES = 60;

const userRepository = AppDataSource.getRepository(User);

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await userRepository.findOneBy({ email });
  if (!user) return;

  const token = randomBytes(32).toString('hex');
  await userRepository.update(user.id, {
    passwordResetTokenHash: hashToken(token),
    passwordResetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000),
  });

  sendMail(
    buildPasswordResetEmail({
      name: user.name,
      email: user.email,
      resetUrl: `${env.CLIENT_URL}/reset-password?token=${token}`,
      expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
    }),
  ).catch(() => undefined);
}

export async function resetPassword({ token, password }: ResetPasswordInput): Promise<void> {
  const user = await userRepository.findOneBy({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpiresAt: MoreThan(new Date()),
  });
  if (!user) throw HttpError.badRequest('This password reset link is invalid or has expired');

  await userRepository.update(user.id, {
    passwordHash: await hashPassword(password),
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
  });
}
