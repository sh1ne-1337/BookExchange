import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse, User } from '@/types/api';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setSession: (session: AuthResponse) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setSession: ({ accessToken, user }) => set({ accessToken, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, user: null }),
    }),
    { name: 'bookswap-auth' },
  ),
);

export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.accessToken !== null);
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'admin');
