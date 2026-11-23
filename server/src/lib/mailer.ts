import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

const SMTP_TIMEOUT_MS = 10_000;

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,

  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  connectionTimeout: SMTP_TIMEOUT_MS,
  greetingTimeout: SMTP_TIMEOUT_MS,
  socketTimeout: SMTP_TIMEOUT_MS,
});

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export async function sendMail(message: MailMessage): Promise<void> {
  try {
    await transporter.sendMail({ from: env.MAIL_FROM, ...message });
  } catch (error) {
    console.error('Failed to send email', error);
    throw new HttpError(502, 'Could not send the email, please try again later');
  }
}
