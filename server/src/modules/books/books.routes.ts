import { Router } from 'express';
import { imageUpload } from '../../lib/uploads.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { emailRateLimit } from '../../middlewares/rate-limit.js';
import * as exchangeRequestsController from '../exchange-requests/exchange-requests.controller.js';
import * as booksController from './books.controller.js';

export const booksRouter = Router();

booksRouter.use(authenticate);

booksRouter.get('/', booksController.list);
booksRouter.get('/:id', booksController.getById);
booksRouter.patch('/:id', imageUpload.single('photo'), booksController.update);
booksRouter.delete('/:id', booksController.remove);
booksRouter.post('/:id/exchange-requests', emailRateLimit, exchangeRequestsController.create);
