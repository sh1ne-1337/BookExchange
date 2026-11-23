import type { Request, Response } from 'express';
import { withUploadedImage } from '../../lib/uploads.js';
import { getAuthUser } from '../../middlewares/authenticate.js';
import { updateProfileSchema } from './me.schemas.js';
import * as meService from './me.service.js';

export async function getProfile(req: Request, res: Response) {
  res.json(await meService.getProfile(getAuthUser(req)));
}

export async function updateProfile(req: Request, res: Response) {
  const input = updateProfileSchema.parse(req.body);
  const profile = await withUploadedImage(req.file, 'avatar', (avatarUrl) =>
    meService.updateProfile(getAuthUser(req), input, avatarUrl),
  );
  res.json(profile);
}
