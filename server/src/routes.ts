import { Router } from 'express';
import { booksRouter } from './modules/books/books.routes.js';

export const apiRouter = Router();

apiRouter.use('/books', booksRouter);
