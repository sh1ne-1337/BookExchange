import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

export function BackToLoginLink() {
  return (
    <Link
      to="/login"
      className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Back to sign in
    </Link>
  );
}
