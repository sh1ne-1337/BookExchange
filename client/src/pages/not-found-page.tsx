import { SearchX } from 'lucide-react';
import { Link } from 'react-router';
import { buttonStyles } from '@/components/ui/styles';
import { EmptyState } from '@/components/ui/empty-state';

export function NotFoundPage() {
  return (
    <EmptyState
      icon={SearchX}
      title="Page not found"
      description="The page you are looking for doesn't exist or has been moved."
      action={
        <Link to="/books" className={buttonStyles()}>
          Browse books
        </Link>
      }
    />
  );
}
