import type { Request, RequestHandler } from 'express';
import { AppDataSource } from '../database/data-source.js';
import { User, UserRole } from '../entities/user.entity.js';
import { HttpError } from '../utils/http-error.js';
import { verifyAccessToken } from '../utils/jwt.js';

const BEARER_PREFIX = 'Bearer ';

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) throw HttpError.unauthorized();

  const userId = verifyAccessToken(header.slice(BEARER_PREFIX.length));

  const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
  if (!user) throw HttpError.unauthorized('User no longer exists');

  req.user = user;
  next();
};

export function authorize(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!roles.includes(getAuthUser(req).role)) throw HttpError.forbidden();
    next();
  };
}

export function getAuthUser(req: Request): User {
  if (!req.user) throw HttpError.unauthorized();
  return req.user;
}
