import { BookPlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { BookCard } from '@/features/books/components/book-card';
import { BookFormDialog } from '@/features/books/components/book-form-dialog';
import { BookGrid, BookGridSkeleton } from '@/features/books/components/book-grid';
import { useDeleteBook } from '@/features/books/hooks/use-book-mutations';
import { useMyBooks } from '@/features/books/hooks/use-books';
import { getErrorMessage } from '@/lib/errors';
import { pluralize } from '@/lib/format';
import type { Book } from '@/types/api';

export function MyBooksPage() {
  const { data: books, isPending, isError, error } = useMyBooks();
  const deleteBook = useDeleteBook();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const confirmDelete = () => {
    if (!bookToDelete) return;
    deleteBook.mutate(bookToDelete.id, {
      onSuccess: () => {
        toast.success(`"${bookToDelete.name}" was deleted`);
        setBookToDelete(null);
      },
    });
  };

  const addBookButton = (
    <Button onClick={() => setIsCreateOpen(true)}>
      <Plus className="size-4" aria-hidden />
      Add book
    </Button>
  );

  return (
    <>
      <PageHeader
        title="My books"
        description={
          books?.length
            ? `You are sharing ${pluralize(books.length, 'book')}`
            : 'Books you are ready to exchange'
        }
        actions={books?.length ? addBookButton : undefined}
      />

      {isPending ? (
        <BookGridSkeleton count={4} />
      ) : isError ? (
        <EmptyState
          icon={BookPlus}
          title="Could not load your books"
          description={getErrorMessage(error)}
        />
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookPlus}
          title="Your shelf is empty"
          description="Add the books you have already read, so other readers can request an exchange."
          action={addBookButton}
        />
      ) : (
        <BookGrid>
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              actions={
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setBookToEdit(book)}
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setBookToDelete(book)}
                    aria-label={`Delete ${book.name}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                </>
              }
            />
          ))}
        </BookGrid>
      )}

      <BookFormDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <BookFormDialog
        isOpen={bookToEdit !== null}
        onClose={() => setBookToEdit(null)}
        book={bookToEdit ?? undefined}
      />
      <ConfirmDialog
        isOpen={bookToDelete !== null}
        onClose={() => {
          setBookToDelete(null);
          deleteBook.reset();
        }}
        onConfirm={confirmDelete}
        isLoading={deleteBook.isPending}
        error={deleteBook.error}
        title="Delete this book?"
        description={`"${bookToDelete?.name}" will be permanently removed from your collection.`}
      />
    </>
  );
}
