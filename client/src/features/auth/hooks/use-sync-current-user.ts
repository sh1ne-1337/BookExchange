import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

export const currentUserQueryKey = ['auth', 'me'] as const;

export function useSyncCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);
  const { data: user } = useQuery({ queryKey: currentUserQueryKey, queryFn: authApi.getMe });

  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);
}
