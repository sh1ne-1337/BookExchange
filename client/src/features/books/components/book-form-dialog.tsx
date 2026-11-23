import { Modal } from '@/components/ui/modal';
import type { Book } from '@/types/api';
import { BookForm } from './book-form';

interface BookFormDialogProps {
  isOpen: boolean;
  onClose: () => void;

  book?: Book;
}

export function BookFormDialog({ isOpen, onClose, book }: BookFormDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={book ? 'Edit book' : 'Add a book'}
      description={book ? undefined : 'Share a book you are ready to exchange.'}
    >
      <BookForm book={book} onSuccess={onClose} onCancel={onClose} />
    </Modal>
  );
}
