import { BackToLoginLink } from '@/features/auth/components/back-to-login-link';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
      <p className="mt-2 mb-8 text-sm text-slate-500">
        Enter your email and we will send you a link to reset it.
      </p>
      <ForgotPasswordForm />
      <BackToLoginLink />
    </>
  );
}
