import type { ExchangeRequest } from '../../entities/exchange-request.entity.js';

export interface IncomingExchangeRequestDto {
  id: string;
  createdAt: Date;
  book: { id: string; name: string; author: string; photoUrl: string | null };
  requester: { id: string; name: string; email: string };
}

export function toIncomingExchangeRequestDto({
  id,
  createdAt,
  book,
  requester,
}: ExchangeRequest): IncomingExchangeRequestDto {
  return {
    id,
    createdAt,
    book: { id: book.id, name: book.name, author: book.author, photoUrl: book.photoUrl },
    requester: { id: requester.id, name: requester.name, email: requester.email },
  };
}
