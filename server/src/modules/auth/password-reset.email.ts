import { renderEmailTemplate } from '../../lib/email-templates.js';
import type { MailMessage } from '../../lib/mailer.js';

interface PasswordResetEmailParams {
  name: string;
  email: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export function buildPasswordResetEmail(params: PasswordResetEmailParams): MailMessage {
  const { name, email, resetUrl, expiresInMinutes } = params;

  const text = [
    `Hi ${name},`,
    '',
    'We received a request to reset your Bookswap password.',
    `Open this link to choose a new password (valid for ${expiresInMinutes} minutes):`,
    resetUrl,
    '',
    'If you did not request a password reset, you can safely ignore this email.',
  ].join('\n');

  return {
    to: email,
    subject: 'Reset your Bookswap password',
    text,
    html: renderEmailTemplate('password-reset', params),
  };
}
