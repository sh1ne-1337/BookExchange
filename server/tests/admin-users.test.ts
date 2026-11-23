import { describe, expect, it } from 'vitest';
import { AppDataSource } from '../src/database/data-source.js';
import { Book } from '../src/entities/book.entity.js';
import { API, api, createTestAdmin, createTestBook, createTestUser, PASSWORD } from './helpers.js';

describe('admin users API', () => {
  it('is available to admins only', async () => {
    const { authHeader } = await createTestUser();

    expect((await api().get(`${API}/admin/users`).set(authHeader)).status).toBe(403);
  });

  it('lists users with their books count and supports search', async () => {
    const admin = await createTestAdmin();
    const { user } = await createTestUser({ name: 'Andrii Melnyk' });
    await createTestBook(user);
    await createTestBook(user);

    const res = await api().get(`${API}/admin/users?search=melnyk`).set(admin.authHeader);

    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(1);
    expect(res.body.items[0]).toMatchObject({ id: user.id, booksCount: 2 });
  });

  it('creates a user who can then log in', async () => {
    const admin = await createTestAdmin();

    const created = await api()
      .post(`${API}/admin/users`)
      .set(admin.authHeader)
      .send({ name: 'New Admin', email: 'new@test.dev', password: PASSWORD, role: 'admin' });
    const login = await api()
      .post(`${API}/auth/login`)
      .send({ email: 'new@test.dev', password: PASSWORD });

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ role: 'admin', booksCount: 0 });
    expect(login.status).toBe(200);
  });

  it('updates a user and rejects a duplicate email', async () => {
    const admin = await createTestAdmin();
    const { user } = await createTestUser();
    const other = await createTestUser();

    const updated = await api()
      .patch(`${API}/admin/users/${user.id}`)
      .set(admin.authHeader)
      .send({ name: 'Renamed', role: 'admin' });
    const duplicate = await api()
      .patch(`${API}/admin/users/${user.id}`)
      .set(admin.authHeader)
      .send({ email: other.user.email });

    expect(updated.body).toMatchObject({ name: 'Renamed', role: 'admin' });
    expect(duplicate.status).toBe(409);
  });

  it('does not let admins change their own role or delete themselves', async () => {
    const admin = await createTestAdmin();

    const demote = await api()
      .patch(`${API}/admin/users/${admin.user.id}`)
      .set(admin.authHeader)
      .send({ role: 'user' });
    const remove = await api().delete(`${API}/admin/users/${admin.user.id}`).set(admin.authHeader);

    expect(demote.status).toBe(400);
    expect(remove.status).toBe(400);
  });

  it("deletes a user together with the user's books", async () => {
    const admin = await createTestAdmin();
    const { user } = await createTestUser();
    await createTestBook(user);

    const res = await api().delete(`${API}/admin/users/${user.id}`).set(admin.authHeader);

    expect(res.status).toBe(204);
    expect(await AppDataSource.getRepository(Book).countBy({ ownerId: user.id })).toBe(0);
  });
});
