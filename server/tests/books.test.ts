import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import {
  API,
  api,
  countUploadedFiles,
  createImage,
  createTestAdmin,
  createTestBook,
  createTestUser,
  readUploadedFile,
  uploadedFileExists,
} from './helpers.js';

describe('GET /books', () => {
  it('requires authentication', async () => {
    expect((await api().get(`${API}/books`)).status).toBe(401);
  });

  it('searches by title or author, case-insensitively', async () => {
    const { user, authHeader } = await createTestUser();
    await createTestBook(user, { name: 'The Hobbit', author: 'J.R.R. Tolkien' });
    await createTestBook(user, { name: 'Kobzar', author: 'Taras Shevchenko' });
    await createTestBook(user, { name: 'Dune', author: 'Frank Herbert' });

    const byTitle = await api().get(`${API}/books?search=HOBB`).set(authHeader);
    const byAuthor = await api().get(`${API}/books?search=shevchenko`).set(authHeader);

    expect(byTitle.body.items.map((book: { name: string }) => book.name)).toEqual(['The Hobbit']);
    expect(byAuthor.body.items.map((book: { name: string }) => book.name)).toEqual(['Kobzar']);
  });

  it('treats LIKE wildcards in the search as plain text', async () => {
    const { user, authHeader } = await createTestUser();
    await createTestBook(user, { name: 'Dune' });
    await createTestBook(user, { name: '100% Organic' });

    const res = await api().get(`${API}/books`).query({ search: '%' }).set(authHeader);

    expect(res.body.items.map((book: { name: string }) => book.name)).toEqual(['100% Organic']);
  });

  it('sorts alphabetically, ignoring case', async () => {
    const { user, authHeader } = await createTestUser();
    for (const name of ['cherry', 'Banana', 'apple']) await createTestBook(user, { name });

    const asc = await api().get(`${API}/books?sort=name_asc`).set(authHeader);
    const desc = await api().get(`${API}/books?sort=name_desc`).set(authHeader);

    const names = (res: typeof asc) => res.body.items.map((book: { name: string }) => book.name);
    expect(names(asc)).toEqual(['apple', 'Banana', 'cherry']);
    expect(names(desc)).toEqual(['cherry', 'Banana', 'apple']);
  });

  it('paginates on the server without overlapping pages', async () => {
    const { user, authHeader } = await createTestUser();
    for (let index = 0; index < 5; index += 1) await createTestBook(user, { name: 'Same title' });

    const page1 = await api().get(`${API}/books?limit=2&page=1`).set(authHeader);
    const page3 = await api().get(`${API}/books?limit=2&page=3`).set(authHeader);
    const page2 = await api().get(`${API}/books?limit=2&page=2`).set(authHeader);

    expect(page1.body.meta).toEqual({ page: 1, limit: 2, total: 5, totalPages: 3 });
    const ids = [page1, page2, page3].flatMap((res) =>
      res.body.items.map((book: { id: string }) => book.id),
    );
    expect(new Set(ids).size).toBe(5);
  });

  it('validates query parameters', async () => {
    const { authHeader } = await createTestUser();

    const res = await api().get(`${API}/books?page=0&sort=price`).set(authHeader);

    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors)).toEqual(['page', 'sort']);
  });
});

describe('GET /books/:id', () => {
  it('returns the book with its owner', async () => {
    const { user, authHeader } = await createTestUser();
    const book = await createTestBook(user);

    const res = await api().get(`${API}/books/${book.id}`).set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: book.id,
      owner: { id: user.id, name: user.name },
      isExchangeRequested: false,
    });
    expect(res.body.owner).not.toHaveProperty('email');
  });

  it('returns 404 for an unknown book and 400 for an invalid id', async () => {
    const { authHeader } = await createTestUser();

    expect((await api().get(`${API}/books/${randomUUID()}`).set(authHeader)).status).toBe(404);
    expect((await api().get(`${API}/books/not-a-uuid`).set(authHeader)).status).toBe(400);
  });
});

describe('POST /me/books', () => {
  it('creates a book with an external photo URL', async () => {
    const { authHeader } = await createTestUser();

    const res = await api()
      .post(`${API}/me/books`)
      .set(authHeader)
      .field('name', 'Dune')
      .field('author', 'Frank Herbert')
      .field('photoUrl', 'https://example.com/dune.jpg');

    expect(res.status).toBe(201);
    expect(res.body.photoUrl).toBe('https://example.com/dune.jpg');
  });

  it('rejects non-http photo URLs', async () => {
    const { authHeader } = await createTestUser();

    const res = await api()
      .post(`${API}/me/books`)
      .set(authHeader)
      .field('name', 'Dune')
      .field('author', 'Frank Herbert')
      .field('photoUrl', 'javascript:alert(1)');

    expect(res.status).toBe(400);
    expect(res.body.errors.photoUrl).toBeDefined();
  });

  it('rejects photo URLs longer than 2048 characters', async () => {
    const { authHeader } = await createTestUser();

    const res = await api()
      .post(`${API}/me/books`)
      .set(authHeader)
      .field('name', 'Dune')
      .field('author', 'Frank Herbert')
      .field('photoUrl', `https://example.com/${'a'.repeat(2048)}.jpg`);

    expect(res.status).toBe(400);
    expect(res.body.errors.photoUrl).toEqual(['URL must be at most 2048 characters']);
  });

  it('stores an uploaded photo as a resized WebP image', async () => {
    const { authHeader } = await createTestUser();

    const res = await api()
      .post(`${API}/me/books`)
      .set(authHeader)
      .field('name', 'Dune')
      .field('author', 'Frank Herbert')
      .attach('photo', await createImage(2000, 3000), {
        filename: 'cover.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(201);
    expect(res.body.photoUrl).toMatch(/^\/uploads\/[\w-]+\.webp$/);
    const metadata = await sharp(readUploadedFile(res.body.photoUrl)).metadata();
    expect(metadata).toMatchObject({ format: 'webp', width: 800, height: 1200 });
  });

  it('rejects a file that is not a real image, whatever its declared type', async () => {
    const { authHeader } = await createTestUser();
    const filesBefore = countUploadedFiles();

    const res = await api()
      .post(`${API}/me/books`)
      .set(authHeader)
      .field('name', 'Dune')
      .field('author', 'Frank Herbert')
      .attach('photo', Buffer.from('<script>alert(1)</script>'), {
        filename: 'cover.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('The file is not a valid image');
    expect(countUploadedFiles()).toBe(filesBefore);
  });
});

describe('PATCH /books/:id', () => {
  it('updates own book and removes the photo when an empty URL is sent', async () => {
    const { user, authHeader } = await createTestUser();
    const book = await createTestBook(user, { photoUrl: 'https://example.com/old.jpg' });

    const res = await api()
      .patch(`${API}/books/${book.id}`)
      .set(authHeader)
      .field('name', 'New title')
      .field('author', 'New author')
      .field('photoUrl', '');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'New title', author: 'New author', photoUrl: null });
  });

  it("forbids editing another user's book and removes the uploaded image", async () => {
    const { user: owner } = await createTestUser();
    const { authHeader } = await createTestUser();
    const book = await createTestBook(owner);
    const filesBefore = countUploadedFiles();

    const res = await api()
      .patch(`${API}/books/${book.id}`)
      .set(authHeader)
      .field('name', 'Hijacked')
      .field('author', 'Someone')
      .attach('photo', await createImage(100, 100), {
        filename: 'a.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(403);
    expect(countUploadedFiles()).toBe(filesBefore);
  });
});

describe('DELETE /books/:id', () => {
  it("forbids deleting another user's book", async () => {
    const { user: owner } = await createTestUser();
    const { authHeader } = await createTestUser();
    const book = await createTestBook(owner);

    expect((await api().delete(`${API}/books/${book.id}`).set(authHeader)).status).toBe(403);
  });

  it('lets an admin delete any book, together with its uploaded photo', async () => {
    const owner = await createTestUser();
    const admin = await createTestAdmin();
    const created = await api()
      .post(`${API}/me/books`)
      .set(owner.authHeader)
      .field('name', 'Dune')
      .field('author', 'Frank Herbert')
      .attach('photo', await createImage(100, 100), {
        filename: 'a.png',
        contentType: 'image/png',
      });
    expect(uploadedFileExists(created.body.photoUrl)).toBe(true);

    const res = await api().delete(`${API}/books/${created.body.id}`).set(admin.authHeader);

    expect(res.status).toBe(204);
    expect(uploadedFileExists(created.body.photoUrl)).toBe(false);
  });
});
