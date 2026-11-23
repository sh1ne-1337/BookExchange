import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { fieldStyles, menuItemStyles, popoverStyles } from './styles';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  id?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-invalid'?: boolean;
}

export function Select<T extends string>({
  value,
  onValueChange,
  options,
  id,
  icon: Icon,
  disabled,
  className,
  ...ariaProps
}: SelectProps<T>) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as T)}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        id={id}
        className={cn(
          fieldStyles,
          'group flex h-10 cursor-pointer items-center justify-between gap-2 text-left data-[state=open]:ring-2 data-[state=open]:ring-primary-600',
          className,
        )}
        {...ariaProps}
      >
        <span className="flex min-w-0 items-center gap-2">
          {Icon && <Icon className="size-4 shrink-0 text-slate-400" aria-hidden />}
          <span className="truncate">
            <SelectPrimitive.Value />
          </span>
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            popoverStyles,
            'max-h-(--radix-select-content-available-height) w-(--radix-select-trigger-width) min-w-40',
          )}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  menuItemStyles,
                  'pr-9 data-[state=checked]:font-medium data-[state=checked]:text-primary-700',
                )}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-3 inline-flex">
                  <Check className="text-primary-600!" aria-hidden />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
