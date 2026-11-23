import { describe, expect, it } from 'vitest';
import { API, api } from './helpers.js';

describe('app', () => {
  it('reports health including the database', async () => {
    const res = await api().get(`${API}/health`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', database: 'up' });
  });

  it('returns 404 for unknown routes', async () => {
    const res = await api().get(`${API}/unknown`);

    expect(res.status).toBe(404);
  });

  it('returns 413 for a JSON body that is too large', async () => {
    const res = await api()
      .post(`${API}/auth/login`)
      .send({ email: 'a@test.dev', password: 'x'.repeat(200_000) });

    expect(res.status).toBe(413);
    expect(res.body.message).toBe('Request body is too large');
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await api()
      .post(`${API}/auth/login`)
      .set('Content-Type', 'application/json')
      .send('{"email":');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Malformed JSON body');
  });
});
