import type { Request, Response } from 'express';
import { withUploadedImage } from '../../lib/uploads.js';
import { getAuthUser } from '../../middlewares/authenticate.js';
import { idParamsSchema } from '../../utils/validation.js';
import { toBookDto } from './books.mapper.js';
import { bookSchema, listBooksQuerySchema } from './books.schemas.js';
import * as booksService from './books.service.js';

export async function list(req: Request, res: Response) {
  const query = listBooksQuerySchema.parse(req.query);
  res.json(await booksService.listBooks(query));
}

export async function getById(req: Request, res: Response) {
  const { id } = idParamsSchema.parse(req.params);
  res.json(await booksService.getBookDetails(id, getAuthUser(req)));
}

export async function listMine(req: Request, res: Response) {
  const books = await booksService.findBooksByOwner(getAuthUser(req).id);
  res.json(books.map(toBookDto));
}

export async function create(req: Request, res: Response) {
  const input = bookSchema.parse(req.body);
  const book = await withUploadedImage(req.file, 'cover', (photoUrl) =>
    booksService.createBook(getAuthUser(req), input, photoUrl),
  );
  res.status(201).json(book);
}

export async function update(req: Request, res: Response) {
  const { id } = idParamsSchema.parse(req.params);
  const input = bookSchema.parse(req.body);
  const book = await withUploadedImage(req.file, 'cover', (photoUrl) =>
    booksService.updateBook(id, getAuthUser(req), input, photoUrl),
  );
  res.json(book);
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamsSchema.parse(req.params);
  await booksService.deleteBook(id, getAuthUser(req));
  res.status(204).end();
}
