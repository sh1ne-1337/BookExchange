import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormErrorAlert } from '@/components/ui/form-error-alert';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useForgotPassword } from '../hooks/use-auth-mutations';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas';

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  if (forgotPassword.isSuccess) {
    return (
      <div className="rounded-xl bg-emerald-50 p-5 text-sm text-emerald-800 ring-1 ring-emerald-200">
        <MailCheck className="mb-3 size-6" aria-hidden />
        <p className="font-semibold">Check your inbox</p>
        <p className="mt-1">
          If an account exists for <strong>{getValues('email')}</strong>, we have sent a link to
          reset your password.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(({ email }) => forgotPassword.mutate(email))}
      noValidate
      className="space-y-5"
    >
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

      <FormErrorAlert error={forgotPassword.error} />

      <Button type="submit" className="w-full" isLoading={forgotPassword.isPending}>
        Send reset link
      </Button>
    </form>
  );
}
