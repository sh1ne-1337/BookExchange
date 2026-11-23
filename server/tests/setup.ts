import { afterAll, beforeAll, beforeEach, vi } from 'vitest';
import { AppDataSource } from '../src/database/data-source.js';
import { installS3Fake, s3Objects } from './s3-fake.js';

vi.mock('../src/lib/mailer.js', () => ({ sendMail: vi.fn().mockResolvedValue(undefined) }));

installS3Fake();

beforeAll(async () => {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
});

beforeEach(async () => {
  await AppDataSource.query('TRUNCATE TABLE exchange_requests, books, users CASCADE');
  vi.clearAllMocks();
  s3Objects.clear();
});

afterAll(async () => {
  await AppDataSource.destroy();
});
