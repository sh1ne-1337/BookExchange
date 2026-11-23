import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
  };
}
