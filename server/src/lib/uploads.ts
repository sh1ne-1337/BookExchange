import { randomUUID } from 'node:crypto';
import path from 'node:path';
import multer from 'multer';
import sharp, { type ResizeOptions } from 'sharp';
import { UPLOADS_PUBLIC_PATH } from '../config/paths.js';
import { HttpError } from '../utils/http-error.js';
import { storage } from './storage.js';

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_PIXELS = 40_000_000;
const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const MAX_IMAGE_SIZE_MESSAGE = `Image must be at most ${MAX_IMAGE_SIZE_MB} MB`;

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024, files: 1, fields: 10 },
  fileFilter: (_req, file, callback) => {
    if (ACCEPTED_MIME_TYPES.has(file.mimetype)) {
      callback(null, true);
    } else {
      callback(HttpError.badRequest('Only JPEG, PNG, WEBP and GIF images are allowed'));
    }
  },
});

const IMAGE_PRESETS = {
  cover: { width: 800, height: 1200, fit: 'inside' },
  avatar: { width: 256, height: 256, fit: 'cover' },
} as const satisfies Record<string, ResizeOptions>;

export type ImagePreset = keyof typeof IMAGE_PRESETS;

async function saveImage(file: Express.Multer.File, preset: ImagePreset): Promise<string> {
  let image: Buffer;
  try {
    image = await sharp(file.buffer, { limitInputPixels: MAX_IMAGE_PIXELS })
      .rotate()
      .resize({ ...IMAGE_PRESETS[preset], withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw HttpError.badRequest('The file is not a valid image');
  }

  const filename = `${randomUUID()}.webp`;
  await storage.save(filename, image, 'image/webp');
  return `${UPLOADS_PUBLIC_PATH}/${filename}`;
}

export async function withUploadedImage<T>(
  file: Express.Multer.File | undefined,
  preset: ImagePreset,
  action: (imageUrl: string | undefined) => Promise<T>,
): Promise<T> {
  const imageUrl = file && (await saveImage(file, preset));

  try {
    return await action(imageUrl);
  } catch (error) {
    await removeUploadedFile(imageUrl);
    throw error;
  }
}

export async function removeUploadedFile(url: string | null | undefined): Promise<void> {
  if (!url?.startsWith(`${UPLOADS_PUBLIC_PATH}/`)) return;

  try {
    await storage.remove(path.basename(url));
  } catch (error) {
    console.error('Failed to remove uploaded file', url, error);
  }
}
