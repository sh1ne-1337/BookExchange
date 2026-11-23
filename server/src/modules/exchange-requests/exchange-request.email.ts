import type { Book } from '../../entities/book.entity.js';
import type { User } from '../../entities/user.entity.js';
import { renderEmailTemplate } from '../../lib/email-templates.js';
import type { MailMessage } from '../../lib/mailer.js';

interface ExchangeRequestEmailParams {
  owner: User;
  requester: User;
  requestedBook: Book;
  offeredBooks: Book[];
  requestedBookUrl: string;
}

export function buildExchangeRequestEmail(params: ExchangeRequestEmailParams): MailMessage {
  const { owner, requester, requestedBook, offeredBooks, requestedBookUrl } = params;

  const text = [
    `Hi ${owner.name},`,
    '',
    `${requester.name} (${requester.email}) would like to exchange books with you for "${requestedBook.name}" by ${requestedBook.author}.`,
    '',
    'Books they can offer:',
    ...offeredBooks.map((book) => `  - ${book.name} by ${book.author}`),
    '',
    `Reply to this email to contact ${requester.name} directly.`,
    `View your book: ${requestedBookUrl}`,
  ].join('\n');

  return {
    to: owner.email,
    replyTo: requester.email,
    subject: `Exchange request for "${requestedBook.name}"`,
    text,
    html: renderEmailTemplate('exchange-request', params),
  };
}
