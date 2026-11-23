import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { fieldStyles } from './styles';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(fieldStyles, 'h-10', className)} {...props} />;
}
