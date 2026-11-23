import { SearchX } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { BookCard } from '@/features/books/components/book-card';
import { BookFilters } from '@/features/books/components/book-filters';
import { BookGrid, BookGridSkeleton } from '@/features/books/components/book-grid';
import { useBooks } from '@/features/books/hooks/use-books';
import { useBooksSearchParams } from '@/features/books/hooks/use-books-search-params';
import { getErrorMessage } from '@/lib/errors';
import { pluralize } from '@/lib/format';
import { cn } from '@/lib/cn';

const BOOKS_PER_PAGE = 12;

export function BooksPage() {
  const [{ search, sort, page }, setParams] = useBooksSearchParams();
  const { data, isPending, isError, error, isPlaceholderData } = useBooks({
    search: search || undefined,
    sort,
    page,
    limit: BOOKS_PER_PAGE,
  });

  const changePage = (nextPage: number) => {
    setParams({ page: nextPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <PageHeader
        title="Discover books"
        description={
          data ? `${pluralize(data.meta.total, 'book')} available for exchange` : 'Loading books…'
        }
      />

      <BookFilters
        search={search}
        sort={sort}
        onSearchChange={(value) => setParams({ search: value })}
        onSortChange={(value) => setParams({ sort: value })}
      />

      {isPending ? (
        <BookGridSkeleton />
      ) : isError ? (
        <EmptyState
          icon={SearchX}
          title="Could not load books"
          description={getErrorMessage(error)}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No books found"
          description={
            search ? `Nothing matches "${search}". Try a different title or author.` : undefined
          }
        />
      ) : (
        <div className="space-y-10">
          <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
            <BookGrid>
              {data.items.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </BookGrid>
          </div>
          <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={changePage} />
        </div>
      )}
    </>
  );
}
