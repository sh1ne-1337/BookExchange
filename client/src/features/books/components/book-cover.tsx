import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

interface BookCoverProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

export function BookCover({ src, alt, className }: BookCoverProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasImage = src && src !== failedSrc;

  return (
    <div className={cn('aspect-[2/3] overflow-hidden rounded-lg bg-slate-100', className)}>
      {hasImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailedSrc(src)}
          className="size-full object-cover"
        />
      ) : (
        <div
          className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary-50 to-primary-100 p-3 text-primary-500"
          role="img"
          aria-label={alt}
        >
          <BookOpen className="size-1/4 min-h-6 min-w-6" aria-hidden />
        </div>
      )}
    </div>
  );
}
