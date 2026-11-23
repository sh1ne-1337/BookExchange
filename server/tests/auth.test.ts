import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { AppDataSource } from '../src/database/data-source.js';
import { User } from '../src/entities/user.entity.js';
import { API, api, createTestUser, PASSWORD } from './helpers.js';

const registration = { name: 'Jane Doe', email: 'jane@test.dev', password: PASSWORD };

describe('POST /auth/register', () => {
  it('creates a user with the "user" role and returns a token', async () => {
    const res = await api()
      .post(`${API}/auth/register`)
      .send({ ...registration, email: '  Jane@Test.DEV ' });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ name: 'Jane Doe', email: 'jane@test.dev', role: 'user' });
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('returns field errors for invalid input', async () => {
    const res = await api()
      .post(`${API}/auth/register`)
      .send({ name: 'J', email: 'not-an-email', password: '123' });

    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors)).toEqual(['name', 'email', 'password']);
  });

  it('rejects a duplicate email with 409 and a field error', async () => {
    await createTestUser({ email: registration.email });

    const res = await api().post(`${API}/auth/register`).send(registration);

    expect(res.status).toBe(409);
    expect(res.body.errors.email).toEqual(['A user with this email already exists']);
  });

  it('accepts only one of several concurrent registrations with the same email', async () => {
    const responses = await Promise.all(
      Array.from({ length: 3 }, () => api().post(`${API}/auth/register`).send(registration)),
    );

    expect(responses.map((res) => res.status).sort()).toEqual([201, 409, 409]);
    expect(await AppDataSource.getRepository(User).countBy({ email: registration.email })).toBe(1);
  });
});

describe('POST /auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const { user } = await createTestUser();

    const res = await api()
      .post(`${API}/auth/login`)
      .send({ email: user.email, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(user.id);
  });

  it('returns the same error for a wrong password and an unknown email', async () => {
    const { user } = await createTestUser();

    const wrongPassword = await api()
      .post(`${API}/auth/login`)
      .send({ email: user.email, password: 'wrong-password' });
    const unknownEmail = await api()
      .post(`${API}/auth/login`)
      .send({ email: 'nobody@test.dev', password: PASSWORD });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual(unknownEmail.body);
  });
});

describe('GET /auth/me', () => {
  it('returns the current user', async () => {
    const { user, authHeader } = await createTestUser();

    const res = await api().get(`${API}/auth/me`).set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(user.email);
  });

  it('rejects requests without a valid token', async () => {
    expect((await api().get(`${API}/auth/me`)).status).toBe(401);
    expect((await api().get(`${API}/auth/me`).set('Authorization', 'Bearer invalid')).status).toBe(
      401,
    );
  });

  it('rejects tokens signed with a different algorithm', async () => {
    const { user } = await createTestUser();
    const token = jwt.sign({}, process.env.JWT_SECRET!, { algorithm: 'HS512', subject: user.id });

    const res = await api().get(`${API}/auth/me`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
  });

  it('rejects the token of a deleted user', async () => {
    const { user, authHeader } = await createTestUser();
    await AppDataSource.getRepository(User).delete(user.id);

    const res = await api().get(`${API}/auth/me`).set(authHeader);

    expect(res.status).toBe(401);
  });
});
