import type { User } from '../entities/user.entity.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}
