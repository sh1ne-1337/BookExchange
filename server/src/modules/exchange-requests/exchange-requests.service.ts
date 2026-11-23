import { env } from '../../config/env.js';
import { AppDataSource } from '../../database/data-source.js';
import { ExchangeRequest } from '../../entities/exchange-request.entity.js';
import type { User } from '../../entities/user.entity.js';
import { sendMail } from '../../lib/mailer.js';
import { HttpError } from '../../utils/http-error.js';
import { findBookByIdOrFail, findBooksByOwner } from '../books/books.service.js';
import { buildExchangeRequestEmail } from './exchange-request.email.js';
import {
  toIncomingExchangeRequestDto,
  type IncomingExchangeRequestDto,
} from './exchange-requests.mapper.js';

const exchangeRequestRepository = AppDataSource.getRepository(ExchangeRequest);

export async function createExchangeRequest(bookId: string, requester: User): Promise<void> {
  const requestedBook = await findBookByIdOrFail(bookId);

  if (requestedBook.ownerId === requester.id) {
    throw HttpError.badRequest('You cannot request an exchange for your own book');
  }

  const offeredBooks = await findBooksByOwner(requester.id);
  if (offeredBooks.length === 0) {
    throw HttpError.badRequest('Add at least one book to your collection to offer an exchange');
  }

  await AppDataSource.transaction(async (manager) => {
    await manager.insert(ExchangeRequest, { bookId, requesterId: requester.id });
    await sendMail(
      buildExchangeRequestEmail({
        owner: requestedBook.owner,
        requester,
        requestedBook,
        offeredBooks,
        requestedBookUrl: `${env.CLIENT_URL}/books/${requestedBook.id}`,
      }),
    );
  });
}

export async function listIncomingExchangeRequests(
  ownerId: string,
): Promise<IncomingExchangeRequestDto[]> {
  const requests = await exchangeRequestRepository.find({
    where: { book: { ownerId } },
    relations: { book: true, requester: true },
    order: { createdAt: 'DESC' },
  });

  return requests.map(toIncomingExchangeRequestDto);
}
