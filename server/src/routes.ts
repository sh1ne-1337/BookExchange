import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { booksRouter } from './modules/books/books.routes.js';
import { meRouter } from './modules/me/me.routes.js';
import { adminUsersRouter } from './modules/users/users.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/books', booksRouter);
apiRouter.use('/me', meRouter);
apiRouter.use('/admin/users', adminUsersRouter);
