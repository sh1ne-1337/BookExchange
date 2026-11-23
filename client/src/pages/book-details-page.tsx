import {
  ArrowLeft,
  ArrowLeftRight,
  CalendarDays,
  Check,
  Pencil,
  Trash2,
  BookX,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buttonStyles } from '@/components/ui/styles';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { PageSpinner } from '@/components/ui/spinner';
import { BookCover } from '@/features/books/components/book-cover';
import { BookFormDialog } from '@/features/books/components/book-form-dialog';
import { RequestExchangeDialog } from '@/features/books/components/request-exchange-dialog';
import { useDeleteBook } from '@/features/books/hooks/use-book-mutations';
import { useBook } from '@/features/books/hooks/use-books';
import { getErrorMessage, getErrorStatus } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { useCurrentUser, useIsAdmin } from '@/store/auth.store';

type ActiveDialog = 'exchange' | 'edit' | 'delete' | null;

export function BookDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useCurrentUser();
  const isAdmin = useIsAdmin();
  const { data: book, isPending, isError, error } = useBook(id);
  const deleteBook = useDeleteBook();
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

  const goBack = () => (location.key === 'default' ? navigate('/books') : navigate(-1));
  const closeDialog = () => {
    setActiveDialog(null);
    deleteBook.reset();
  };

  if (isPending) return <PageSpinner />;

  if (isError) {
    return (
      <EmptyState
        icon={BookX}
        title={getErrorStatus(error) === 404 ? 'Book not found' : 'Could not load the book'}
        description={
          getErrorStatus(error) === 404
            ? 'It may have been removed by its owner.'
            : getErrorMessage(error)
        }
        action={
          <Link to="/books" className={buttonStyles()}>
            Browse books
          </Link>
        }
      />
    );
  }

  const isOwner = book.owner.id === currentUser?.id;
  const canDelete = isOwner || isAdmin;

  const confirmDelete = () => {
    deleteBook.mutate(book.id, {
      onSuccess: () => {
        toast.success(`"${book.name}" was deleted`);
        navigate('/books', { replace: true });
      },
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={goBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </button>

      <article className="grid gap-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8 md:grid-cols-[18rem_1fr]">
        <BookCover
          src={book.photoUrl}
          alt={`Cover of ${book.name}`}
          className="mx-auto w-full max-w-72 shadow-md"
        />

        <div className="flex flex-col">
          {isOwner && (
            <Badge variant="primary" className="mb-3 self-start">
              Your book
            </Badge>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{book.name}</h1>
          <p className="mt-2 text-lg text-slate-600">by {book.author}</p>

          <dl className="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">Shared by</dt>
              <dd className="mt-1.5 flex items-center gap-2 font-medium text-slate-900">
                <Avatar name={book.owner.name} size="sm" />
                {isOwner ? 'You' : book.owner.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Added</dt>
              <dd className="mt-1.5 flex h-8 items-center gap-2 font-medium text-slate-900">
                <CalendarDays className="size-4 text-slate-400" aria-hidden />
                {formatDate(book.createdAt)}
              </dd>
            </div>
          </dl>

          <div className="mt-auto flex flex-wrap gap-3 pt-8">
            {isOwner ? (
              <Button variant="secondary" onClick={() => setActiveDialog('edit')}>
                <Pencil className="size-4" aria-hidden />
                Edit
              </Button>
            ) : book.isExchangeRequested ? (
              <Button disabled variant="secondary">
                <Check className="size-4 text-emerald-600" aria-hidden />
                Exchange requested
              </Button>
            ) : (
              <Button onClick={() => setActiveDialog('exchange')}>
                <ArrowLeftRight className="size-4" aria-hidden />
                Request exchange
              </Button>
            )}

            {canDelete && (
              <Button
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setActiveDialog('delete')}
              >
                <Trash2 className="size-4" aria-hidden />
                Delete
              </Button>
            )}
          </div>
        </div>
      </article>

      <RequestExchangeDialog
        isOpen={activeDialog === 'exchange'}
        onClose={closeDialog}
        book={book}
      />
      <BookFormDialog isOpen={activeDialog === 'edit'} onClose={closeDialog} book={book} />
      <ConfirmDialog
        isOpen={activeDialog === 'delete'}
        onClose={closeDialog}
        onConfirm={confirmDelete}
        isLoading={deleteBook.isPending}
        error={deleteBook.error}
        title="Delete this book?"
        description={`"${book.name}" will be permanently removed${isOwner ? '' : ` from ${book.owner.name}'s collection`}.`}
      />
    </>
  );
}
