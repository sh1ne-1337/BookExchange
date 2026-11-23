import { BookPlus } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { buttonStyles } from '@/components/ui/styles';
import { EmptyState } from '@/components/ui/empty-state';
import { FormErrorAlert } from '@/components/ui/form-error-alert';
import { Modal, ModalActions } from '@/components/ui/modal';
import { PageSpinner } from '@/components/ui/spinner';
import type { BookDetails } from '@/types/api';
import { useRequestExchange } from '../hooks/use-book-mutations';
import { useMyBooks } from '../hooks/use-books';
import { BookCover } from './book-cover';

interface RequestExchangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookDetails;
}

export function RequestExchangeDialog({ isOpen, onClose, book }: RequestExchangeDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request "${book.name}"`}
      description={`${book.owner.name} will receive an email with your name, email and the list of books you can offer.`}
    >
      <RequestExchangeContent book={book} onClose={onClose} />
    </Modal>
  );
}

function RequestExchangeContent({ book, onClose }: { book: BookDetails; onClose: () => void }) {
  const { data: myBooks, isPending } = useMyBooks();
  const requestExchange = useRequestExchange(book.id);

  const sendRequest = () => {
    requestExchange.mutate(undefined, {
      onSuccess: () => {
        toast.success(`Exchange request sent to ${book.owner.name}`);
        onClose();
      },
    });
  };

  if (isPending) return <PageSpinner />;

  if (!myBooks?.length) {
    return (
      <EmptyState
        icon={BookPlus}
        title="You have no books to offer yet"
        description="Add at least one book to your collection to request an exchange."
        action={
          <Link to="/me/books" className={buttonStyles()}>
            Add a book
          </Link>
        }
      />
    );
  }

  return (
    <>
      <h3 className="mb-3 text-sm font-medium text-slate-700">
        Books you can offer ({myBooks.length})
      </h3>
      <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg ring-1 ring-slate-200">
        {myBooks.map((myBook) => (
          <li key={myBook.id} className="flex items-center gap-3 p-3">
            <BookCover
              src={myBook.photoUrl}
              alt={`Cover of ${myBook.name}`}
              className="w-10 rounded"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{myBook.name}</p>
              <p className="truncate text-xs text-slate-500">{myBook.author}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <FormErrorAlert error={requestExchange.error} />
      </div>

      <ModalActions>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={sendRequest} isLoading={requestExchange.isPending}>
          Send request
        </Button>
      </ModalActions>
    </>
  );
}
