import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { buttonStyles } from '@/components/ui/styles';
import { FormErrorAlert } from '@/components/ui/form-error-alert';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useFilePreview } from '@/hooks/use-file-preview';
import { applyServerFieldErrors } from '@/lib/errors';
import { ACCEPTED_IMAGE_TYPES } from '@/lib/validation';
import type { User } from '@/types/api';
import { useUpdateProfile } from '../hooks/use-profile';
import { profileFormSchema, type ProfileFormValues } from '../schemas';

export function ProfileForm({ user }: { user: User }) {
  const updateProfile = useUpdateProfile();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: user.name, email: user.email, avatar: undefined, removeAvatar: false },
  });

  const [name, avatar, removeAvatar] = useWatch({
    control,
    name: ['name', 'avatar', 'removeAvatar'],
  });
  const avatarPreview = useFilePreview(avatar);
  const displayedAvatar = avatarPreview ?? (removeAvatar ? null : user.avatarUrl);

  const onSubmit = handleSubmit((values) => {
    updateProfile.mutate(values, {
      onSuccess: (updatedUser) => {
        toast.success('Profile updated');
        reset({
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: undefined,
          removeAvatar: false,
        });
      },
      onError: (error) => applyServerFieldErrors(error, setError),
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="flex items-center gap-5">
        <Avatar name={name || user.name} src={displayedAvatar} size="lg" />
        <div>
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor="avatar"
              className={buttonStyles({
                variant: 'secondary',
                size: 'sm',
                className: 'cursor-pointer',
              })}
            >
              Change photo
            </label>
            <input
              id="avatar"
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setValue('avatar', file, { shouldValidate: true, shouldDirty: true });
                  setValue('removeAvatar', false);
                }
                event.target.value = '';
              }}
            />
            {displayedAvatar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setValue('avatar', undefined, { shouldValidate: true });
                  setValue('removeAvatar', true, { shouldDirty: true });
                }}
              >
                Remove
              </Button>
            )}
          </div>
          {errors.avatar ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {errors.avatar.message}
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">JPG, PNG, WEBP or GIF, up to 5 MB</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="profile-name" error={errors.name?.message}>
          <Input
            id="profile-name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
        </FormField>
        <FormField label="Email" htmlFor="profile-email" error={errors.email?.message}>
          <Input
            id="profile-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </FormField>
      </div>

      <FormErrorAlert error={updateProfile.error} />

      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty} isLoading={updateProfile.isPending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
