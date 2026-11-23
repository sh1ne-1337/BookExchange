import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormErrorAlert } from '@/components/ui/form-error-alert';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { applyServerFieldErrors } from '@/lib/errors';
import { useRegister } from '../hooks/use-auth-mutations';
import { registerSchema, type RegisterFormValues } from '../schemas';

export function RegisterForm() {
  const navigate = useNavigate();
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(({ confirmPassword: _, ...payload }) => {
    registerUser.mutate(payload, {
      onSuccess: ({ user }) => {
        toast.success(`Welcome to Bookswap, ${user.name}!`);
        navigate('/me/books', { replace: true });
      },
      onError: (error) => applyServerFieldErrors(error, setError),
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Jane Doe"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
      </FormField>

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

      <FormField
        label="Password"
        htmlFor="password"
        error={errors.password?.message}
        hint="At least 8 characters"
      >
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
      </FormField>

      <FormField
        label="Confirm password"
        htmlFor="confirmPassword"
        error={errors.confirmPassword?.message}
      >
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
      </FormField>

      <FormErrorAlert error={registerUser.error} />

      <Button type="submit" className="w-full" isLoading={registerUser.isPending}>
        Create account
      </Button>
    </form>
  );
}
