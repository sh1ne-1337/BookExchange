import { In } from 'typeorm';
import { AppDataSource } from '../../database/data-source.js';
import { Book } from '../../entities/book.entity.js';
import { ExchangeRequest } from '../../entities/exchange-request.entity.js';
import { UserRole, type User } from '../../entities/user.entity.js';
import { removeUploadedFile } from '../../lib/uploads.js';
import { HttpError } from '../../utils/http-error.js';
import { getOffset, toPaginated, type Paginated } from '../../utils/pagination.js';
import { escapeLikePattern } from '../../utils/validation.js';
import { toBookDto, type BookDetailsDto, type BookDto } from './books.mapper.js';
import type { BookInput, BookSort, ListBooksQuery } from './books.schemas.js';

const bookRepository = AppDataSource.getRepository(Book);
const exchangeRequestRepository = AppDataSource.getRepository(ExchangeRequest);

const SORT_ORDER: Record<BookSort, { column: string; direction: 'ASC' | 'DESC' }> = {
  name_asc: { column: 'LOWER(book.name)', direction: 'ASC' },
  name_desc: { column: 'LOWER(book.name)', direction: 'DESC' },
  author_asc: { column: 'LOWER(book.author)', direction: 'ASC' },
  author_desc: { column: 'LOWER(book.author)', direction: 'DESC' },
  newest: { column: 'book.createdAt', direction: 'DESC' },
};

export async function findBookByIdOrFail(id: string): Promise<Book> {
  const book = await bookRepository.findOne({ where: { id }, relations: { owner: true } });
  if (!book) throw HttpError.notFound('Book not found');
  return book;
}

export async function listBooks({
  search,
  sort,
  ...pagination
}: ListBooksQuery): Promise<Paginated<BookDto>> {
  const query = bookRepository.createQueryBuilder('book').innerJoinAndSelect('book.owner', 'owner');

  if (search) {
    query.where('(book.name ILIKE :search OR book.author ILIKE :search)', {
      search: `%${escapeLikePattern(search)}%`,
    });
  }

  const { column, direction } = SORT_ORDER[sort];
  const [books, total] = await query
    .orderBy(column, direction)
    .addOrderBy('book.id')
    .offset(getOffset(pagination))
    .limit(pagination.limit)
    .getManyAndCount();

  return toPaginated(books.map(toBookDto), total, pagination);
}

export async function getBookDetails(id: string, viewer: User): Promise<BookDetailsDto> {
  const book = await findBookByIdOrFail(id);
  const isExchangeRequested = await exchangeRequestRepository.existsBy({
    bookId: id,
    requesterId: viewer.id,
  });

  return { ...toBookDto(book), isExchangeRequested };
}

export function findBooksByOwner(ownerId: string): Promise<Book[]> {
  return bookRepository.find({
    where: { ownerId },
    relations: { owner: true },
    order: { createdAt: 'DESC' },
  });
}

export async function createBook(
  owner: User,
  { photoUrl, ...input }: BookInput,
  uploadedPhotoUrl?: string,
): Promise<BookDto> {
  const book = bookRepository.create({
    ...input,
    photoUrl: uploadedPhotoUrl ?? photoUrl ?? null,
    owner,
  });
  return toBookDto(await bookRepository.save(book));
}

export async function updateBook(
  id: string,
  actor: User,
  { photoUrl, ...changes }: BookInput,
  uploadedPhotoUrl?: string,
): Promise<BookDto> {
  const book = await findBookByIdOrFail(id);
  if (book.ownerId !== actor.id) throw HttpError.forbidden('You can only edit your own books');

  const previousPhotoUrl = book.photoUrl;
  const nextPhotoUrl = uploadedPhotoUrl ?? photoUrl;
  bookRepository.merge(book, {
    ...changes,
    ...(nextPhotoUrl !== undefined && { photoUrl: nextPhotoUrl }),
  });

  const savedBook = await bookRepository.save(book);
  if (savedBook.photoUrl !== previousPhotoUrl) await removeUploadedFile(previousPhotoUrl);
  return toBookDto(savedBook);
}

export async function deleteBook(id: string, actor: User): Promise<void> {
  const book = await findBookByIdOrFail(id);

  const canDelete = book.ownerId === actor.id || actor.role === UserRole.Admin;
  if (!canDelete) throw HttpError.forbidden('You can only delete your own books');

  await bookRepository.remove(book);
  await removeUploadedFile(book.photoUrl);
}

export async function countBooksByOwners(ownerIds: string[]): Promise<Map<string, number>> {
  if (ownerIds.length === 0) return new Map();

  const rows = await bookRepository
    .createQueryBuilder('book')
    .select('book.ownerId', 'ownerId')
    .addSelect('COUNT(*)::int', 'count')
    .where({ ownerId: In(ownerIds) })
    .groupBy('book.ownerId')
    .getRawMany<{ ownerId: string; count: number }>();

  return new Map(rows.map(({ ownerId, count }) => [ownerId, count]));
}
