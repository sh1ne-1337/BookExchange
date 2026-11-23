import { describe, expect, it } from 'vitest';
import { AppDataSource } from '../src/database/data-source.js';
import { User } from '../src/entities/user.entity.js';
import { API, api, createTestUser, sentEmails } from './helpers.js';

const NEW_PASSWORD = 'NewPassword456';
const GENERIC_RESPONSE = {
  message: 'If an account with this email exists, a reset link has been sent',
};

function extractToken(text: string): string {
  const token = /token=([a-f0-9]+)/.exec(text)?.[1];
  if (!token) throw new Error('No reset token in the email');
  return token;
}

async function requestReset(email: string) {
  const res = await api().post(`${API}/auth/forgot-password`).send({ email });
  return { res, token: sentEmails()[0] && extractToken(sentEmails()[0].text) };
}

describe('password reset', () => {
  it('answers the same for unknown emails and sends nothing', async () => {
    const { res } = await requestReset('nobody@test.dev');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(GENERIC_RESPONSE);
    expect(sentEmails()).toHaveLength(0);
  });

  it('emails a single-use link that sets a new password', async () => {
    const { user } = await createTestUser();
    const { res, token } = await requestReset(user.email);
    expect(res.body).toEqual(GENERIC_RESPONSE);
    expect(sentEmails()[0].to).toBe(user.email);

    const reset = await api()
      .post(`${API}/auth/reset-password`)
      .send({ token, password: NEW_PASSWORD });
    const reused = await api()
      .post(`${API}/auth/reset-password`)
      .send({ token, password: NEW_PASSWORD });
    const login = await api()
      .post(`${API}/auth/login`)
      .send({ email: user.email, password: NEW_PASSWORD });

    expect(reset.status).toBe(200);
    expect(reused.status).toBe(400);
    expect(login.status).toBe(200);
  });

  it('rejects an expired link', async () => {
    const { user } = await createTestUser();
    const { token } = await requestReset(user.email);
    await AppDataSource.getRepository(User).update(user.id, {
      passwordResetExpiresAt: new Date(Date.now() - 1000),
    });

    const res = await api()
      .post(`${API}/auth/reset-password`)
      .send({ token, password: NEW_PASSWORD });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('This password reset link is invalid or has expired');
  });
});
