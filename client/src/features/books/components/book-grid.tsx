import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const GRID_CLASSES = 'grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5';

export function BookGrid({ children }: { children: ReactNode }) {
  return <div className={GRID_CLASSES}>{children}</div>;
}

export function BookGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={GRID_CLASSES} aria-busy="true" aria-label="Loading books">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
          <Skeleton className="aspect-[2/3]" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
