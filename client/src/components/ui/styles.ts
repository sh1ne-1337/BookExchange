import { cn } from '@/lib/cn';

const BUTTON_VARIANTS = {
  primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700',
  secondary: 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-300 ring-inset hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
} as const;

const BUTTON_SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-sm',
  icon: 'size-9',
} as const;

export interface ButtonStyleProps {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  className?: string;
}

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: ButtonStyleProps = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
    'disabled:pointer-events-none disabled:opacity-60',
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className,
  );
}

export const popoverStyles =
  'z-50 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200 data-[state=open]:animate-popover-in';

export const menuItemStyles = cn(
  'relative flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none select-none',
  'data-highlighted:bg-slate-100 data-highlighted:text-slate-900',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
  '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-slate-400',
);

export const fieldStyles = cn(
  'block w-full rounded-lg border-0 bg-white px-3 text-sm text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset',
  'placeholder:text-slate-400 focus:ring-2 focus:ring-primary-600 focus:outline-none',
  'aria-invalid:ring-red-400 aria-invalid:focus:ring-red-500',
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
);
