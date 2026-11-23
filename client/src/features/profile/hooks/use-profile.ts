import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/api/profile.api';
import { bookKeys } from '@/features/books/query-keys';
import { useAuthStore } from '@/store/auth.store';
import { profileKeys } from '../query-keys';

export function useProfile() {
  return useQuery({ queryKey: profileKeys.detail(), queryFn: profileApi.get });
}

export function useIncomingExchangeRequests() {
  return useQuery({
    queryKey: profileKeys.incomingExchangeRequests(),
    queryFn: profileApi.listIncomingExchangeRequests,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: profileApi.update,
    onSuccess: ({ booksCount: _, ...user }) => {
      setUser(user);

      return Promise.all([
        queryClient.invalidateQueries({ queryKey: profileKeys.all }),
        queryClient.invalidateQueries({ queryKey: bookKeys.all }),
      ]);
    },
  });
}
