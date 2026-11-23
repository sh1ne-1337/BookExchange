import { BookMarked, Library, Shield } from 'lucide-react';
import { NavLink } from 'react-router';
import { cn } from '@/lib/cn';
import { useCurrentUser, useIsAdmin } from '@/store/auth.store';
import { Logo } from './logo';
import { UserMenu } from './user-menu';

const NAV_ITEMS = [
  { to: '/books', label: 'Books', icon: Library, end: true },
  { to: '/me/books', label: 'My books', icon: BookMarked, end: false },
];

const ADMIN_NAV_ITEM = { to: '/admin', label: 'Admin', icon: Shield, end: false };

export function Header() {
  const user = useCurrentUser();
  const isAdmin = useIsAdmin();
  const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:gap-8 sm:px-6">
        <Logo className="hidden sm:flex" />

        <nav className="flex flex-1 items-center gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )
              }
            >
              <Icon className="size-4" aria-hidden />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        {user && <UserMenu user={user} />}
      </div>
    </header>
  );
}
