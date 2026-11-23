import { UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Skeleton } from '@/components/ui/skeleton';
import { UserFormDialog } from '@/features/admin/components/user-form-dialog';
import { UsersTable } from '@/features/admin/components/users-table';
import { useDeleteUser, useUsers } from '@/features/admin/hooks/use-users';
import { cn } from '@/lib/cn';
import { getErrorMessage } from '@/lib/errors';
import { pluralize } from '@/lib/format';
import type { UserWithStats } from '@/types/api';

const USERS_PER_PAGE = 10;

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, isPlaceholderData } = useUsers({
    search: search || undefined,
    page,
    limit: USERS_PER_PAGE,
  });
  const deleteUser = useDeleteUser();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserWithStats | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserWithStats | null>(null);

  const confirmDelete = () => {
    if (!userToDelete) return;
    deleteUser.mutate(userToDelete.id, {
      onSuccess: () => {
        toast.success(`${userToDelete.name} was deleted`);
        setUserToDelete(null);
      },
    });
  };

  return (
    <>
      <PageHeader
        title="Users"
        description={
          data ? `${pluralize(data.meta.total, 'user')} registered` : 'Manage user accounts'
        }
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <UserPlus className="size-4" aria-hidden />
            Add user
          </Button>
        }
      />

      <SearchInput
        value={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search by name or email…"
        className="mb-6 sm:max-w-sm"
      />

      {isPending ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : isError ? (
        <EmptyState
          icon={Users}
          title="Could not load users"
          description={getErrorMessage(error)}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try a different name or email."
        />
      ) : (
        <div className="space-y-8">
          <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
            <UsersTable users={data.items} onEdit={setUserToEdit} onDelete={setUserToDelete} />
          </div>
          <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        </div>
      )}

      <UserFormDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <UserFormDialog
        isOpen={userToEdit !== null}
        onClose={() => setUserToEdit(null)}
        user={userToEdit ?? undefined}
      />
      <ConfirmDialog
        isOpen={userToDelete !== null}
        onClose={() => {
          setUserToDelete(null);
          deleteUser.reset();
        }}
        onConfirm={confirmDelete}
        isLoading={deleteUser.isPending}
        error={deleteUser.error}
        title="Delete this user?"
        description={`${userToDelete?.name}'s account and all of their books (${userToDelete?.booksCount ?? 0}) will be permanently deleted.`}
      />
    </>
  );
}
