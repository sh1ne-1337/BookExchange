import { Outlet } from 'react-router';
import { useSyncCurrentUser } from '@/features/auth/hooks/use-sync-current-user';
import { Header } from './header';

export function AppLayout() {
  useSyncCurrentUser();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
