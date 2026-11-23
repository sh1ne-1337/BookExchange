import path from 'node:path';
import sharp from 'sharp';
import request from 'supertest';
import { vi } from 'vitest';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import { AppDataSource } from '../src/database/data-source.js';
import { Book } from '../src/entities/book.entity.js';
import { UserRole, type User } from '../src/entities/user.entity.js';
import { sendMail } from '../src/lib/mailer.js';
import { createUser } from '../src/modules/users/users.service.js';
import { signAccessToken } from '../src/utils/jwt.js';
import { s3Objects } from './s3-fake.js';

export const API = '/api/v1';
export const PASSWORD = 'Password123';

const app = createApp();
export const api = () => request(app);

export interface TestUser {
  user: User;
  token: string;
  authHeader: { Authorization: string };
}

let userCounter = 0;

export async function createTestUser(
  overrides: { name?: string; email?: string; role?: UserRole } = {},
): Promise<TestUser> {
  userCounter += 1;
  const user = await createUser({
    name: overrides.name ?? `User ${userCounter}`,
    email: overrides.email ?? `user${userCounter}@test.dev`,
    password: PASSWORD,
    role: overrides.role ?? UserRole.User,
  });
  const token = signAccessToken(user.id);
  return { user, token, authHeader: { Authorization: `Bearer ${token}` } };
}

export function createTestAdmin() {
  return createTestUser({ name: 'Admin', role: UserRole.Admin });
}

export function createTestBook(
  owner: User,
  overrides: Partial<Pick<Book, 'name' | 'author' | 'photoUrl'>> = {},
): Promise<Book> {
  const repository = AppDataSource.getRepository(Book);
  return repository.save(
    repository.create({
      name: 'Test Book',
      author: 'Test Author',
      photoUrl: null,
      owner,
      ...overrides,
    }),
  );
}

export const sentEmails = () => vi.mocked(sendMail).mock.calls.map(([message]) => message);

export function createImage(width: number, height: number): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: '#4f46e5' } })
    .png()
    .toBuffer();
}

const toStorageKey = (url: string) => `${env.S3_KEY_PREFIX}${path.basename(url)}`;

export function readUploadedFile(url: string): Buffer | undefined {
  return s3Objects.get(toStorageKey(url))?.body;
}

export function uploadedFileExists(url: string): boolean {
  return s3Objects.has(toStorageKey(url));
}

export function countUploadedFiles(): number {
  return s3Objects.size;
}
