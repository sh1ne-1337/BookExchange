import { Link } from 'react-router';
import { RegisterForm } from '@/features/auth/components/register-form';

export function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 mb-8 text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
      <RegisterForm />
    </>
  );
}
