import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

const NON_RETRYABLE_STATUSES = new Set([400, 401, 403, 404]);
const MAX_RETRIES = 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        return !NON_RETRYABLE_STATUSES.has(status ?? 0) && failureCount < MAX_RETRIES;
      },
    },
  },
});
