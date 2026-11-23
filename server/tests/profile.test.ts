import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import {
  API,
  api,
  countUploadedFiles,
  createImage,
  createTestBook,
  createTestUser,
  readUploadedFile,
  uploadedFileExists,
} from './helpers.js';

const uploadAvatar = async (authHeader: { Authorization: string }, size = 600) =>
  api()
    .patch(`${API}/me/profile`)
    .set(authHeader)
    .attach('avatar', await createImage(size, size), {
      filename: 'avatar.png',
      contentType: 'image/png',
    });

describe('GET /me/profile', () => {
  it('returns the current user with the number of books', async () => {
    const { user, authHeader } = await createTestUser();
    await createTestBook(user);
    await createTestBook(user);

    const res = await api().get(`${API}/me/profile`).set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: user.id, email: user.email, booksCount: 2 });
    expect(res.body).not.toHaveProperty('passwordHash');
  });
});

describe('PATCH /me/profile', () => {
  it('updates the name and the normalized email', async () => {
    const { authHeader } = await createTestUser();

    const res = await api()
      .patch(`${API}/me/profile`)
      .set(authHeader)
      .field('name', 'New Name')
      .field('email', ' New@Test.DEV ');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'New Name', email: 'new@test.dev' });
  });

  it('rejects an email that belongs to another user', async () => {
    const { authHeader } = await createTestUser();
    const other = await createTestUser();

    const res = await api()
      .patch(`${API}/me/profile`)
      .set(authHeader)
      .field('email', other.user.email);

    expect(res.status).toBe(409);
    expect(res.body.errors.email).toBeDefined();
  });

  it('stores the avatar as a 256×256 WebP image', async () => {
    const { authHeader } = await createTestUser();

    const res = await uploadAvatar(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.avatarUrl).toMatch(/^\/uploads\/[\w-]+\.webp$/);
    const metadata = await sharp(readUploadedFile(res.body.avatarUrl)).metadata();
    expect(metadata).toMatchObject({ format: 'webp', width: 256, height: 256 });
  });

  it('deletes the previous avatar when it is replaced or removed', async () => {
    const { authHeader } = await createTestUser();
    const first = await uploadAvatar(authHeader);

    const second = await uploadAvatar(authHeader);
    expect(uploadedFileExists(first.body.avatarUrl)).toBe(false);
    expect(uploadedFileExists(second.body.avatarUrl)).toBe(true);

    const removed = await api()
      .patch(`${API}/me/profile`)
      .set(authHeader)
      .field('removeAvatar', 'true');
    expect(removed.body.avatarUrl).toBeNull();
    expect(countUploadedFiles()).toBe(0);
  });

  it('does not keep the uploaded avatar when the update fails', async () => {
    const { authHeader } = await createTestUser();
    const other = await createTestUser();

    const res = await api()
      .patch(`${API}/me/profile`)
      .set(authHeader)
      .field('email', other.user.email)
      .attach('avatar', await createImage(300, 300), {
        filename: 'a.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(409);
    expect(countUploadedFiles()).toBe(0);
  });
});
