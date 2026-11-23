import { describe, expect, it, vi } from 'vitest';
import { AppDataSource } from '../src/database/data-source.js';
import { ExchangeRequest } from '../src/entities/exchange-request.entity.js';
import { sendMail } from '../src/lib/mailer.js';
import { HttpError } from '../src/utils/http-error.js';
import { API, api, createTestBook, createTestUser, sentEmails } from './helpers.js';

async function setUpExchange() {
  const owner = await createTestUser({ name: 'Iryna', email: 'iryna@test.dev' });
  const requester = await createTestUser({ name: 'Olena', email: 'olena@test.dev' });
  const requestedBook = await createTestBook(owner.user, {
    name: 'Death and the Penguin',
    author: 'Andrey Kurkov',
  });
  await createTestBook(requester.user, { name: 'Kobzar', author: 'Taras Shevchenko' });
  await createTestBook(requester.user, { name: 'Voroshilovgrad', author: 'Serhiy Zhadan' });
  return { owner, requester, requestedBook };
}

const requestExchange = (bookId: string, authHeader: { Authorization: string }) =>
  api().post(`${API}/books/${bookId}/exchange-requests`).set(authHeader);

describe('POST /books/:id/exchange-requests', () => {
  it("emails the owner with the requester's contacts and books", async () => {
    const { owner, requester, requestedBook } = await setUpExchange();

    const res = await requestExchange(requestedBook.id, requester.authHeader);

    expect(res.status).toBe(201);
    expect(sentEmails()).toHaveLength(1);
    const [email] = sentEmails();
    expect(email).toMatchObject({
      to: owner.user.email,
      replyTo: requester.user.email,
      subject: 'Exchange request for "Death and the Penguin"',
    });
    for (const content of [email.html, email.text]) {
      expect(content).toContain('Olena');
      expect(content).toContain('olena@test.dev');
      expect(content).toContain('Kobzar');
      expect(content).toContain('Voroshilovgrad');
    }
  });

  it('marks the book as requested for the requester', async () => {
    const { requester, requestedBook } = await setUpExchange();
    await requestExchange(requestedBook.id, requester.authHeader);

    const res = await api().get(`${API}/books/${requestedBook.id}`).set(requester.authHeader);

    expect(res.body.isExchangeRequested).toBe(true);
  });

  it('does not allow requesting your own book', async () => {
    const { owner, requestedBook } = await setUpExchange();

    const res = await requestExchange(requestedBook.id, owner.authHeader);

    expect(res.status).toBe(400);
    expect(sentEmails()).toHaveLength(0);
  });

  it('requires the requester to have books to offer', async () => {
    const { requestedBook } = await setUpExchange();
    const { authHeader } = await createTestUser();

    const res = await requestExchange(requestedBook.id, authHeader);

    expect(res.status).toBe(400);
    expect(sentEmails()).toHaveLength(0);
  });

  it('rejects a repeated request without sending another email', async () => {
    const { requester, requestedBook } = await setUpExchange();
    await requestExchange(requestedBook.id, requester.authHeader);

    const res = await requestExchange(requestedBook.id, requester.authHeader);

    expect(res.status).toBe(409);
    expect(sentEmails()).toHaveLength(1);
  });

  it('handles concurrent duplicate requests: one succeeds, one email is sent', async () => {
    const { requester, requestedBook } = await setUpExchange();

    const responses = await Promise.all([
      requestExchange(requestedBook.id, requester.authHeader),
      requestExchange(requestedBook.id, requester.authHeader),
    ]);

    expect(responses.map((res) => res.status).sort()).toEqual([201, 409]);
    expect(sentEmails()).toHaveLength(1);
  });

  it('does not store the request when the email cannot be sent', async () => {
    const { requester, requestedBook } = await setUpExchange();
    vi.mocked(sendMail).mockRejectedValueOnce(new HttpError(502, 'Could not send the email'));

    const res = await requestExchange(requestedBook.id, requester.authHeader);

    expect(res.status).toBe(502);
    expect(await AppDataSource.getRepository(ExchangeRequest).count()).toBe(0);
  });
});

describe('GET /me/exchange-requests', () => {
  it('lists requests for books of the current user', async () => {
    const { owner, requester, requestedBook } = await setUpExchange();
    await requestExchange(requestedBook.id, requester.authHeader);

    const ownerView = await api().get(`${API}/me/exchange-requests`).set(owner.authHeader);
    const requesterView = await api().get(`${API}/me/exchange-requests`).set(requester.authHeader);

    expect(ownerView.body).toHaveLength(1);
    expect(ownerView.body[0]).toMatchObject({
      book: { id: requestedBook.id },
      requester: { name: 'Olena', email: 'olena@test.dev' },
    });
    expect(requesterView.body).toHaveLength(0);
  });
});
