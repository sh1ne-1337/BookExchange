import { ArrowLeftRight, BookOpen, Search } from 'lucide-react';
import { Outlet } from 'react-router';
import { Logo } from './logo';

const CURRENT_YEAR = new Date().getFullYear();

const FEATURES = [
  { icon: BookOpen, text: 'Share the books you have already read' },
  { icon: Search, text: 'Discover books from other readers' },
  { icon: ArrowLeftRight, text: 'Request an exchange in one click' },
];

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary-600 p-12 text-white lg:flex">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-white/10" aria-hidden />
        <div className="absolute -bottom-32 -left-16 size-80 rounded-full bg-white/5" aria-hidden />

        <div className="relative flex items-center gap-2 text-lg font-bold">
          <span className="rounded-lg bg-white/15 p-1.5">
            <BookOpen className="size-5" aria-hidden />
          </span>
          Bookswap
        </div>

        <div className="relative">
          <h2 className="text-4xl leading-tight font-bold">
            Give your books
            <br />a second life.
          </h2>
          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-primary-100">
                <Icon className="size-5 shrink-0" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-primary-200">© {CURRENT_YEAR} Bookswap</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Logo className="mb-10 lg:hidden" />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
