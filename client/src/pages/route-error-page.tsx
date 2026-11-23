import { RefreshCw, TriangleAlert } from 'lucide-react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { Button } from '@/components/ui/button';
import { buttonStyles } from '@/components/ui/styles';

function isChunkLoadError(error: unknown): boolean {
  return error instanceof TypeError && /dynamically imported module|import/i.test(error.message);
}

function getErrorContent(error: unknown) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return { title: 'Page not found', description: "The page you are looking for doesn't exist." };
  }
  if (isChunkLoadError(error)) {
    return {
      title: 'A new version is available',
      description: 'Reload the page to get the latest version of Bookswap.',
    };
  }
  return {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Try reloading the page.',
  };
}

export function RouteErrorPage() {
  const error = useRouteError();
  const { title, description } = getErrorContent(error);

  if (import.meta.env.DEV) console.error(error);

  return (
    <div
      role="alert"
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
    >
      <div className="mb-4 rounded-full bg-red-50 p-3 text-red-600">
        <TriangleAlert className="size-6" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="size-4" aria-hidden />
          Reload page
        </Button>
        <Link to="/books" className={buttonStyles({ variant: 'secondary' })}>
          Go to books
        </Link>
      </div>
    </div>
  );
}
