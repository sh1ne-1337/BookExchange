import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormErrorAlert } from '@/components/ui/form-error-alert';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useResetPassword } from '../hooks/use-auth-mutations';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas';

export function ResetPasswordForm({ token }: { token: string }) {
  const navigate = useNavigate();
  const resetPassword = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(({ password }) => {
    resetPassword.mutate(
      { token, password },
      {
        onSuccess: () => {
          toast.success('Your password has been reset. You can sign in now.');
          navigate('/login', { replace: true });
        },
      },
    );
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormField
        label="New password"
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
        label="Confirm new password"
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

      <FormErrorAlert error={resetPassword.error} />

      <Button type="submit" className="w-full" isLoading={resetPassword.isPending}>
        Reset password
      </Button>
    </form>
  );
}
