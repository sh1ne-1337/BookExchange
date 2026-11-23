import { Inbox, Mail } from 'lucide-react';
import { Link } from 'react-router';
import { EmptyState } from '@/components/ui/empty-state';
import { BookCover } from '@/features/books/components/book-cover';
import { formatDate } from '@/lib/format';
import type { IncomingExchangeRequest } from '@/types/api';

export function ExchangeRequestsList({ requests }: { requests: IncomingExchangeRequest[] }) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No exchange requests yet"
        description="When someone wants one of your books, you will see it here and receive an email."
      />
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {requests.map(({ id, book, requester, createdAt }) => (
        <li key={id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
          <Link to={`/books/${book.id}`} className="shrink-0">
            <BookCover src={book.photoUrl} alt={`Cover of ${book.name}`} className="w-12 rounded" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-900">
              <span className="font-semibold">{requester.name}</span> wants to exchange for{' '}
              <Link
                to={`/books/${book.id}`}
                className="font-semibold text-primary-700 hover:underline"
              >
                {book.name}
              </Link>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{formatDate(createdAt)}</p>
          </div>
          <a
            href={`mailto:${requester.email}?subject=${encodeURIComponent(`Book exchange: ${book.name}`)}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
          >
            <Mail className="size-4" aria-hidden />
            <span className="hidden sm:inline">Reply</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
