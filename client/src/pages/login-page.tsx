import { Link } from 'react-router';
import { LoginForm } from '@/features/auth/components/login-form';

export function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Sign in to your account</h1>
      <p className="mt-2 mb-8 text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
          Sign up
        </Link>
      </p>
      <LoginForm />
    </>
  );
}
