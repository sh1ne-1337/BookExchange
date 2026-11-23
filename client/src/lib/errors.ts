import { isAxiosError } from 'axios';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { ApiErrorBody } from '@/types/api';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message ?? FALLBACK_MESSAGE;
  }
  return FALLBACK_MESSAGE;
}

export function getErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

export function getFormErrorMessage(error: unknown): string | null {
  if (isAxiosError<ApiErrorBody>(error) && error.response?.data?.errors) return null;
  return getErrorMessage(error);
}

export function applyServerFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!isAxiosError<ApiErrorBody>(error)) return false;

  const fieldErrors = Object.entries(error.response?.data?.errors ?? {});
  for (const [field, messages] of fieldErrors) {
    if (messages?.[0]) setError(field as Path<T>, { message: messages[0] });
  }
  return fieldErrors.length > 0;
}
