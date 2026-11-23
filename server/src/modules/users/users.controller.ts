import type { Request, Response } from 'express';
import { getAuthUser } from '../../middlewares/authenticate.js';
import { idParamsSchema } from '../../utils/validation.js';
import { toUserWithStatsDto } from './users.mapper.js';
import { createUserSchema, listUsersQuerySchema, updateUserSchema } from './users.schemas.js';
import * as usersService from './users.service.js';

export async function list(req: Request, res: Response) {
  const query = listUsersQuerySchema.parse(req.query);
  res.json(await usersService.listUsers(query));
}

export async function create(req: Request, res: Response) {
  const input = createUserSchema.parse(req.body);
  const user = await usersService.createUser(input);
  res.status(201).json(toUserWithStatsDto(user, 0));
}

export async function update(req: Request, res: Response) {
  const { id } = idParamsSchema.parse(req.params);
  const input = updateUserSchema.parse(req.body);
  res.json(await usersService.updateUserAsAdmin(id, input, getAuthUser(req)));
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamsSchema.parse(req.params);
  await usersService.deleteUserAsAdmin(id, getAuthUser(req));
  res.status(204).end();
}
