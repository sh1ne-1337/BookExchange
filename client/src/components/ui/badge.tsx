import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const VARIANTS = {
  neutral: 'bg-slate-100 text-slate-700',
  primary: 'bg-primary-50 text-primary-700 ring-primary-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
} as const;

interface BadgeProps {
  variant?: keyof typeof VARIANTS;
  className?: string;
  children: ReactNode;
}

export function Badge({ variant = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-transparent ring-inset',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
