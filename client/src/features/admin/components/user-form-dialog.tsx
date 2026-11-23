import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormErrorAlert } from '@/components/ui/form-error-alert';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Modal, ModalActions } from '@/components/ui/modal';
import { Select, type SelectOption } from '@/components/ui/select';
import { applyServerFieldErrors } from '@/lib/errors';
import { useCurrentUser } from '@/store/auth.store';
import type { UserRole, UserWithStats } from '@/types/api';
import { useCreateUser, useUpdateUser } from '../hooks/use-users';
import { createUserFormSchema, editUserFormSchema, type UserFormValues } from '../schemas';

const ROLE_OPTIONS: SelectOption<UserRole>[] = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
];

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;

  user?: UserWithStats;
}

export function UserFormDialog({ isOpen, onClose, user }: UserFormDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit user' : 'Add a user'}>
      <UserForm user={user} onClose={onClose} />
    </Modal>
  );
}

function UserForm({ user, onClose }: Omit<UserFormDialogProps, 'isOpen'>) {
  const currentUser = useCurrentUser();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const isEditing = !!user;
  const isSelf = user?.id === currentUser?.id;
  const saveUser = isEditing ? updateUser : createUser;

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(isEditing ? editUserFormSchema : createUserFormSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
      role: user?.role ?? 'user',
    },
  });

  const onSubmit = handleSubmit(({ password, ...values }) => {
    const callbacks = {
      onSuccess: () => {
        toast.success(isEditing ? 'User updated' : `${values.name} was added`);
        onClose();
      },
      onError: (error: unknown) => applyServerFieldErrors(error, setError),
    };

    if (user) {
      const payload = password ? { ...values, password } : values;
      updateUser.mutate({ id: user.id, payload }, callbacks);
    } else {
      createUser.mutate({ ...values, password }, callbacks);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormField label="Name" htmlFor="user-name" error={errors.name?.message}>
        <Input id="user-name" aria-invalid={!!errors.name} {...register('name')} />
      </FormField>

      <FormField label="Email" htmlFor="user-email" error={errors.email?.message}>
        <Input id="user-email" type="email" aria-invalid={!!errors.email} {...register('email')} />
      </FormField>

      <FormField
        label="Password"
        htmlFor="user-password"
        error={errors.password?.message}
        hint={isEditing ? 'Leave empty to keep the current password' : 'At least 8 characters'}
      >
        <Input
          id="user-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
      </FormField>

      <FormField
        label="Role"
        htmlFor="user-role"
        error={errors.role?.message}
        hint={isSelf ? 'You cannot change your own role' : undefined}
      >
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select
              id="user-role"
              value={field.value}
              onValueChange={field.onChange}
              options={ROLE_OPTIONS}
              disabled={isSelf}
            />
          )}
        />
      </FormField>

      <FormErrorAlert error={saveUser.error} />

      <ModalActions>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={saveUser.isPending}>
          {isEditing ? 'Save changes' : 'Add user'}
        </Button>
      </ModalActions>
    </form>
  );
}
