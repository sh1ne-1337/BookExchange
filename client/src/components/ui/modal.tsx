import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm data-[state=open]:animate-fade-in">
          <DialogPrimitive.Content
            className={cn(
              'w-full max-w-lg rounded-2xl bg-white p-6 text-slate-900 shadow-xl focus:outline-none data-[state=open]:animate-dialog-in',
              className,
            )}

            {...(!description && { 'aria-describedby': undefined })}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <DialogPrimitive.Title className="text-lg font-semibold">
                  {title}
                </DialogPrimitive.Title>
                {description && (
                  <DialogPrimitive.Description className="mt-1 text-sm text-slate-500">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close" className="-mt-1 -mr-2">
                  <X className="size-5" />
                </Button>
              </DialogPrimitive.Close>
            </div>
            {children}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function ModalActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{children}</div>
  );
}
