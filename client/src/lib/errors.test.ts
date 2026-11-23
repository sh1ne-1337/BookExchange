import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import type { ApiErrorBody } from '@/types/api';
import { applyServerFieldErrors, getErrorMessage, getFormErrorMessage } from './errors';

function createApiError(status: number, data: ApiErrorBody) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('Request failed', undefined, config, undefined, {
    status,
    statusText: '',
    headers: {},
    config,
    data,
  });
}

describe('getErrorMessage', () => {
  it('returns the message from the API', () => {
    expect(getErrorMessage(createApiError(403, { message: 'Forbidden' }))).toBe('Forbidden');
  });

  it('falls back to a generic message for unknown errors', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('Something went wrong. Please try again.');
  });
});

describe('getFormErrorMessage', () => {
  it('returns null when the error is shown next to the fields', () => {
    const error = createApiError(409, { message: 'Taken', errors: { email: ['Taken'] } });

    expect(getFormErrorMessage(error)).toBeNull();
  });
});

describe('applyServerFieldErrors', () => {
  it('sets the first message of each field', () => {
    const setError = vi.fn();
    const error = createApiError(400, {
      message: 'Validation failed',
      errors: { email: ['Invalid email', 'Second'], name: ['Too short'] },
    });

    expect(applyServerFieldErrors(error, setError)).toBe(true);
    expect(setError).toHaveBeenCalledWith('email', { message: 'Invalid email' });
    expect(setError).toHaveBeenCalledWith('name', { message: 'Too short' });
  });

  it('returns false when there are no field errors', () => {
    expect(applyServerFieldErrors(createApiError(500, { message: 'Oops' }), vi.fn())).toBe(false);
  });
});
