import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_URL: z.url().default('http://localhost:5173'),

  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5433),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_NAME: z.string().default('book_exchange'),

  TRUST_PROXY: z
    .preprocess((value) => value || undefined, z.string().optional())
    .transform((value) => {
      if (value === undefined || value === 'false') return false;
      if (value === 'true') return true;
      return /^\d+$/.test(value) ? Number(value) : value;
    }),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('Book Exchange <no-reply@bookexchange.local>'),

  S3_BUCKET: z.string().min(1, 'S3_BUCKET is required'),
  S3_REGION: z.string().min(1, 'S3_REGION is required'),
  S3_ACCESS_KEY_ID: z.preprocess((value) => value || undefined, z.string().optional()),
  S3_SECRET_ACCESS_KEY: z.preprocess((value) => value || undefined, z.string().optional()),
  S3_KEY_PREFIX: z.string().default('bookswap/uploads/'),

  DEMO_EMAIL: z.preprocess((value) => value || undefined, z.email().optional()),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(`Invalid environment variables:\n${z.prettifyError(parsedEnv.error)}`);
  process.exit(1);
}

export const env = parsedEnv.data;
