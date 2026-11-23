import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/format';
import { useCurrentUser } from '@/store/auth.store';
import type { UserWithStats } from '@/types/api';

interface UsersTableProps {
  users: UserWithStats[];
  onEdit: (user: UserWithStats) => void;
  onDelete: (user: UserWithStats) => void;
}

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  const currentUser = useCurrentUser();

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium tracking-wide text-slate-500 uppercase">
          <tr>
            <th scope="col" className="px-6 py-3">
              User
            </th>
            <th scope="col" className="px-6 py-3">
              Role
            </th>
            <th scope="col" className="px-6 py-3">
              Books
            </th>
            <th scope="col" className="px-6 py-3">
              Joined
            </th>
            <th scope="col" className="px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => {
            const isSelf = user.id === currentUser?.id;
            return (
              <tr key={user.id} className="hover:bg-slate-50/60">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {user.name}
                        {isSelf && <span className="ml-1.5 font-normal text-slate-400">(you)</span>}
                      </p>
                      <p className="truncate text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={user.role === 'admin' ? 'primary' : 'neutral'}
                    className="capitalize"
                  >
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-slate-700">{user.booksCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${user.name}`}
                          className="data-[state=open]:bg-slate-100"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => onEdit(user)}>
                          <Pencil aria-hidden />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="danger"
                          disabled={isSelf}
                          onSelect={() => onDelete(user)}
                        >
                          <Trash2 aria-hidden />
                          {isSelf ? "Can't delete yourself" : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
