import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { queryClient } from './query-client';
import { router } from './router';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />

      <Toaster position="top-right" offset={{ top: 80 }} richColors closeButton />
    </QueryClientProvider>
  );
}
