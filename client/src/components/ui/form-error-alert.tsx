import { CircleAlert } from 'lucide-react';
import { getFormErrorMessage } from '@/lib/errors';

export function FormErrorAlert({ error }: { error: unknown }) {
  const message = error ? getFormErrorMessage(error) : null;
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex gap-2.5 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200 ring-inset"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{message}</p>
    </div>
  );
}
