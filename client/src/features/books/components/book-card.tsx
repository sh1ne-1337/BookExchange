import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/store/auth.store';
import type { Book } from '@/types/api';
import { BookCover } from './book-cover';

interface BookCardProps {
  book: Book;

  actions?: ReactNode;
}

export function BookCard({ book, actions }: BookCardProps) {
  const currentUser = useCurrentUser();
  const isOwn = book.owner.id === currentUser?.id;

  return (
    <article className="group flex flex-col rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/books/${book.id}`} className="flex flex-1 flex-col focus-visible:outline-none">
        <BookCover src={book.photoUrl} alt={`Cover of ${book.name}`} />
        <div className="mt-3 flex flex-1 flex-col px-1">
          <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-primary-700">
            {book.name}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{book.author}</p>
          <div className="mt-auto pt-3">
            {isOwn ? (
              <Badge variant="primary">Your book</Badge>
            ) : (
              <p className="truncate text-xs text-slate-400">Shared by {book.owner.name}</p>
            )}
          </div>
        </div>
      </Link>
      {actions && <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">{actions}</div>}
    </article>
  );
}
