import type { Request } from 'express';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

function createRateLimit(limit: number, keyGenerator?: (req: Request) => string) {
  return rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit,
    keyGenerator,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'test',
    message: { message: 'Too many attempts, please try again in a few minutes' },
  });
}

export const authRateLimit = createRateLimit(50);

export const emailRateLimit = createRateLimit(
  10,
  (req) => req.user?.id ?? ipKeyGenerator(req.ip ?? ''),
);
