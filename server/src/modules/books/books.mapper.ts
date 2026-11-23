import type { Book } from '../../entities/book.entity.js';

export interface BookDto {
  id: string;
  name: string;
  author: string;
  photoUrl: string | null;
  createdAt: Date;
  owner: { id: string; name: string };
}

export interface BookDetailsDto extends BookDto {
  isExchangeRequested: boolean;
}

export function toBookDto(book: Book): BookDto {
  return {
    id: book.id,
    name: book.name,
    author: book.author,
    photoUrl: book.photoUrl,
    createdAt: book.createdAt,
    owner: { id: book.owner.id, name: book.owner.name },
  };
}
