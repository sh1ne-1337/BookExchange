import { BookOpen } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/books" className={cn('flex items-center gap-2 font-bold text-slate-900', className)}>
      <span className="rounded-lg bg-primary-600 p-1.5 text-white">
        <BookOpen className="size-4" aria-hidden />
      </span>
      Bookswap
    </Link>
  );
}
