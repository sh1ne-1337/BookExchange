import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from './http-error.js';

const ALGORITHM = 'HS256';

export function signAccessToken(userId: string): string {
  return jwt.sign({}, env.JWT_SECRET, {
    algorithm: ALGORITHM,
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): string {
  try {
    const { sub } = jwt.verify(token, env.JWT_SECRET, {
      algorithms: [ALGORITHM],
    }) as jwt.JwtPayload;
    if (!sub) throw new Error('Token has no subject');
    return sub;
  } catch {
    throw HttpError.unauthorized('Invalid or expired token');
  }
}
