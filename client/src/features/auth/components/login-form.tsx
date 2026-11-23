import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormErrorAlert } from '@/components/ui/form-error-alert';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { applyServerFieldErrors } from '@/lib/errors';
import type { RedirectState } from '@/routes/guards';
import { useLogin } from '../hooks/use-auth-mutations';
import { loginSchema, type LoginFormValues } from '../schemas';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: ({ user }) => {
        toast.success(`Welcome back, ${user.name}!`);
        const { from } = (location.state ?? {}) as RedirectState;
        navigate(from ?? '/books', { replace: true });
      },
      onError: (error) => applyServerFieldErrors(error, setError),
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
      </FormField>

      <FormField label="Password" htmlFor="password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
      </FormField>

      <div className="-mt-2 text-right">
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Forgot password?
        </Link>
      </div>

      <FormErrorAlert error={login.error} />

      <Button type="submit" className="w-full" isLoading={login.isPending}>
        Sign in
      </Button>
    </form>
  );
}
