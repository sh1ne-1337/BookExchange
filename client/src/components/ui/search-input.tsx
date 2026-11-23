import { Search } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { cn } from '@/lib/cn';
import { Input } from './input';

interface SearchInputProps {
  value: string;
  onSearch: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function SearchInput({ value, onSearch, placeholder, className }: SearchInputProps) {
  const [input, setInput] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const [submittedValue, setSubmittedValue] = useState(value);

  if (value !== previousValue) {
    setPreviousValue(value);
    if (value !== submittedValue) {
      setSubmittedValue(value);
      setInput(value);
    }
  }

  const debouncedSearch = useDebouncedCallback((nextValue: string) => {
    setSubmittedValue(nextValue);
    onSearch(nextValue);
  });

  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <Input
        type="search"
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
          debouncedSearch(event.target.value.trim());
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
      />
    </div>
  );
}
