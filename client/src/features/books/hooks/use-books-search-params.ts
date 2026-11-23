import { useSearchParams } from 'react-router';
import { BOOK_SORT_OPTIONS, type BookSort } from '@/types/api';

const DEFAULT_SORT: BookSort = 'name_asc';

interface BooksSearchParams {
  search: string;
  sort: BookSort;
  page: number;
}

function isBookSort(value: string | null): value is BookSort {
  return BOOK_SORT_OPTIONS.includes(value as BookSort);
}

export function useBooksSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const sortParam = searchParams.get('sort');
  const params: BooksSearchParams = {
    search: searchParams.get('search') ?? '',
    sort: isBookSort(sortParam) ? sortParam : DEFAULT_SORT,
    page: Math.max(1, Number(searchParams.get('page')) || 1),
  };

  const setParams = (changes: Partial<BooksSearchParams>) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        const { search, sort, page } = { ...params, ...changes };

        const isFilterChange = changes.search !== undefined || changes.sort !== undefined;
        const nextPage = isFilterChange ? 1 : page;

        setOrDelete(next, 'search', search.trim());
        setOrDelete(next, 'sort', sort === DEFAULT_SORT ? '' : sort);
        setOrDelete(next, 'page', nextPage === 1 ? '' : String(nextPage));
        return next;
      },

      { replace: changes.search !== undefined },
    );
  };

  return [params, setParams] as const;
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}
