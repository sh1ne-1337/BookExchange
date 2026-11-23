import { useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi, type BookPayload } from '@/api/books.api';
import { profileKeys } from '@/features/profile/query-keys';
import type { BookDetails } from '@/types/api';
import { bookKeys } from '../query-keys';

function useInvalidateBooks() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: bookKeys.all }),
      queryClient.invalidateQueries({ queryKey: profileKeys.all }),
    ]);
}

export function useCreateBook() {
  const invalidateBooks = useInvalidateBooks();
  return useMutation({ mutationFn: booksApi.create, onSuccess: invalidateBooks });
}

export function useUpdateBook() {
  const invalidateBooks = useInvalidateBooks();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BookPayload }) =>
      booksApi.update(id, payload),
    onSuccess: invalidateBooks,
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  const invalidateBooks = useInvalidateBooks();
  return useMutation({
    mutationFn: booksApi.remove,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: bookKeys.detail(id) });
      return invalidateBooks();
    },
  });
}

export function useRequestExchange(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => booksApi.requestExchange(bookId),
    onSuccess: () => {
      queryClient.setQueryData<BookDetails>(bookKeys.detail(bookId), (book) =>
        book ? { ...book, isExchangeRequested: true } : book,
      );
    },
  });
}
