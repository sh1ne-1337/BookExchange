import type { Request, Response } from 'express';
import { getAuthUser } from '../../middlewares/authenticate.js';
import { idParamsSchema } from '../../utils/validation.js';
import * as exchangeRequestsService from './exchange-requests.service.js';

export async function create(req: Request, res: Response) {
  const { id: bookId } = idParamsSchema.parse(req.params);
  await exchangeRequestsService.createExchangeRequest(bookId, getAuthUser(req));
  res.status(201).json({ message: 'Exchange request sent' });
}

export async function listIncoming(req: Request, res: Response) {
  res.json(await exchangeRequestsService.listIncomingExchangeRequests(getAuthUser(req).id));
}
