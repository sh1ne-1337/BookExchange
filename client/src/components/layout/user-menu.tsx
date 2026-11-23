import { BookMarked, ChevronDown, LogOut, Shield, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/features/auth/hooks/use-logout';
import type { User } from '@/types/api';

export function UserMenu({ user }: { user: User }) {
  const logout = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group flex items-center gap-2 rounded-full py-1 pr-2 pl-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-primary-600 data-[state=open]:bg-slate-100"
        aria-label="Open user menu"
      >
        <Avatar name={user.name} src={user.avatarUrl} size="sm" />
        <span className="hidden max-w-32 truncate md:inline">{user.name}</span>
        <ChevronDown
          className="size-4 text-slate-400 transition-transform group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserRound aria-hidden />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/me/books">
            <BookMarked aria-hidden />
            My books
          </Link>
        </DropdownMenuItem>
        {user.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <Shield aria-hidden />
              Admin panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger" onSelect={logout}>
          <LogOut aria-hidden />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
