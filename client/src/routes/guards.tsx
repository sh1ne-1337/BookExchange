import { Navigate, Outlet, useLocation } from 'react-router';
import { useIsAdmin, useIsAuthenticated } from '@/store/auth.store';

export interface RedirectState {
  from?: string;
}

export function ProtectedRoute() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    const state: RedirectState = { from: location.pathname + location.search };
    return <Navigate to="/login" replace state={state} />;
  }
  return <Outlet />;
}

export function GuestRoute() {
  const isAuthenticated = useIsAuthenticated();
  return isAuthenticated ? <Navigate to="/books" replace /> : <Outlet />;
}

export function AdminRoute() {
  const isAdmin = useIsAdmin();
  return isAdmin ? <Outlet /> : <Navigate to="/books" replace />;
}
