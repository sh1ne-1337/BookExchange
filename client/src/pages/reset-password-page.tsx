import { Link, useSearchParams } from 'react-router';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { BackToLoginLink } from '@/features/auth/components/back-to-login-link';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Choose a new password</h1>
      {token ? (
        <>
          <p className="mt-2 mb-8 text-sm text-slate-500">Enter a new password for your account.</p>
          <ResetPasswordForm token={token} />
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-500">
          This reset link is incomplete.{' '}
          <Link to="/forgot-password" className="font-medium text-primary-600">
            Request a new one
          </Link>
          .
        </p>
      )}
      <BackToLoginLink />
    </>
  );
}
