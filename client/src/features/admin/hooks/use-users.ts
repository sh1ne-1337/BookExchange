import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UpdateUserPayload, type UsersQuery } from '@/api/users.api';
import { currentUserQueryKey } from '@/features/auth/hooks/use-sync-current-user';
import { bookKeys } from '@/features/books/query-keys';
import { userKeys } from '../query-keys';

export function useUsers(query: UsersQuery) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => usersApi.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),

    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
        queryClient.invalidateQueries({ queryKey: bookKeys.all }),
        queryClient.invalidateQueries({ queryKey: currentUserQueryKey }),
      ]),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.remove,

    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
        queryClient.invalidateQueries({ queryKey: bookKeys.all }),
      ]),
  });
}
