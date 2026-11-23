import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { booksApi, type BooksQuery } from '@/api/books.api';
import { bookKeys } from '../query-keys';

export function useBooks(query: BooksQuery) {
  return useQuery({
    queryKey: bookKeys.list(query),
    queryFn: () => booksApi.list(query),

    placeholderData: keepPreviousData,
  });
}

export function useBook(id: string) {
  return useQuery({ queryKey: bookKeys.detail(id), queryFn: () => booksApi.getById(id) });
}

export function useMyBooks() {
  return useQuery({ queryKey: bookKeys.mine(), queryFn: booksApi.listMine });
}
