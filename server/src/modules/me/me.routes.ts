import { Router } from 'express';
import { imageUpload } from '../../lib/uploads.js';
import { authenticate } from '../../middlewares/authenticate.js';
import * as booksController from '../books/books.controller.js';
import * as exchangeRequestsController from '../exchange-requests/exchange-requests.controller.js';
import * as meController from './me.controller.js';

export const meRouter = Router();

meRouter.use(authenticate);

meRouter.get('/profile', meController.getProfile);
meRouter.patch('/profile', imageUpload.single('avatar'), meController.updateProfile);

meRouter.get('/books', booksController.listMine);
meRouter.post('/books', imageUpload.single('photo'), booksController.create);

meRouter.get('/exchange-requests', exchangeRequestsController.listIncoming);
