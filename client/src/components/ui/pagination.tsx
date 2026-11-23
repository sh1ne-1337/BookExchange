import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ELLIPSIS = '…';

type PageItem = number | typeof ELLIPSIS;

function getVisiblePages(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const start = Math.max(2, Math.min(page - 1, totalPages - 4));
  const end = Math.min(totalPages - 1, Math.max(page + 1, 5));

  const pages: PageItem[] = [1];
  if (start > 2) pages.push(ELLIPSIS);
  for (let current = start; current <= end; current++) pages.push(current);
  if (end < totalPages - 1) pages.push(ELLIPSIS);
  pages.push(totalPages);
  return pages;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {getVisiblePages(page, totalPages).map((item, index) =>
        item === ELLIPSIS ? (
          <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
            {ELLIPSIS}
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? 'primary' : 'ghost'}
            size="icon"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn('text-sm', item === page && 'pointer-events-none')}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
