import type { Book, BookDetails, BookSort, Paginated } from '@/types/api';
import { http } from './http';

export interface BooksQuery {
  search?: string;
  sort?: BookSort;
  page?: number;
  limit?: number;
}

export interface BookPayload {
  name: string;
  author: string;
  photo?: File;

  photoUrl?: string;
}

function toFormData({ name, author, photo, photoUrl }: BookPayload): FormData {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('author', author);
  if (photo) formData.append('photo', photo);
  else if (photoUrl !== undefined) formData.append('photoUrl', photoUrl);
  return formData;
}

export const booksApi = {
  list: (query: BooksQuery) =>
    http.get<Paginated<Book>>('/books', { params: query }).then((res) => res.data),

  getById: (id: string) => http.get<BookDetails>(`/books/${id}`).then((res) => res.data),

  listMine: () => http.get<Book[]>('/me/books').then((res) => res.data),

  create: (payload: BookPayload) =>
    http.post<Book>('/me/books', toFormData(payload)).then((res) => res.data),

  update: (id: string, payload: BookPayload) =>
    http.patch<Book>(`/books/${id}`, toFormData(payload)).then((res) => res.data),

  remove: (id: string) => http.delete(`/books/${id}`),

  requestExchange: (id: string) => http.post(`/books/${id}/exchange-requests`),
};
