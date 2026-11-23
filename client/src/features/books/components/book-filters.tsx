import { ArrowUpDown } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { Select, type SelectOption } from '@/components/ui/select';
import type { BookSort } from '@/types/api';

const SORT_OPTIONS: SelectOption<BookSort>[] = [
  { value: 'name_asc', label: 'Title: A → Z' },
  { value: 'name_desc', label: 'Title: Z → A' },
  { value: 'author_asc', label: 'Author: A → Z' },
  { value: 'author_desc', label: 'Author: Z → A' },
  { value: 'newest', label: 'Recently added' },
];

interface BookFiltersProps {
  search: string;
  sort: BookSort;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: BookSort) => void;
}

export function BookFilters({ search, sort, onSearchChange, onSortChange }: BookFiltersProps) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row">
      <SearchInput
        value={search}
        onSearch={onSearchChange}
        placeholder="Search by title or author…"
        className="flex-1"
      />
      <Select
        value={sort}
        onValueChange={onSortChange}
        options={SORT_OPTIONS}
        icon={ArrowUpDown}
        aria-label="Sort books"
        className="sm:w-52"
      />
    </div>
  );
}
