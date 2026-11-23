import type { ComponentProps } from 'react';
import { Loader2 } from 'lucide-react';
import { buttonStyles, type ButtonStyleProps } from './styles';

interface ButtonProps extends ComponentProps<'button'>, ButtonStyleProps {
  isLoading?: boolean;
}

export function Button({
  variant,
  size,
  isLoading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
