import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { BookPayload } from '@/api/books.api';
import { Button } from '@/components/ui/button';
import { FormErrorAlert } from '@/components/ui/form-error-alert';
import { FormField } from '@/components/ui/form-field';
import { ImageDropzone } from '@/components/ui/image-dropzone';
import { Input } from '@/components/ui/input';
import { ModalActions } from '@/components/ui/modal';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useFilePreview } from '@/hooks/use-file-preview';
import { applyServerFieldErrors } from '@/lib/errors';
import { isHttpUrl } from '@/lib/validation';
import type { Book } from '@/types/api';
import { useCreateBook, useUpdateBook } from '../hooks/use-book-mutations';
import { bookFormSchema, type BookFormValues, type PhotoSource } from '../schemas';
import { isUploadedImage } from '../utils';
import { BookCover } from './book-cover';

const PHOTO_SOURCE_OPTIONS: { value: PhotoSource; label: string }[] = [
  { value: 'upload', label: 'Upload file' },
  { value: 'url', label: 'Image URL' },
];

function getDefaultValues(book?: Book): BookFormValues {
  const externalPhotoUrl = book?.photoUrl && !isUploadedImage(book.photoUrl) ? book.photoUrl : '';
  return {
    name: book?.name ?? '',
    author: book?.author ?? '',
    photoSource: externalPhotoUrl ? 'url' : 'upload',
    photoUrl: externalPhotoUrl,
    photo: undefined,
  };
}

function toPayload({ name, author, photoSource, photoUrl, photo }: BookFormValues): BookPayload {
  return photoSource === 'upload' ? { name, author, photo } : { name, author, photoUrl };
}

interface BookFormProps {
  book?: Book;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookForm({ book, onSuccess, onCancel }: BookFormProps) {
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const isEditing = !!book;
  const saveBook = isEditing ? updateBook : createBook;

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: getDefaultValues(book),
  });

  const [photoSource, photo, photoUrl] = useWatch({
    control,
    name: ['photoSource', 'photo', 'photoUrl'],
  });
  const selectedFileUrl = useFilePreview(photo);
  const currentUploadedPhoto = isUploadedImage(book?.photoUrl) ? book?.photoUrl : null;
  const previewSrc =
    photoSource === 'upload'
      ? (selectedFileUrl ?? currentUploadedPhoto)
      : isHttpUrl(photoUrl)
        ? photoUrl
        : null;

  const onSubmit = handleSubmit((values) => {
    const payload = toPayload(values);
    const callbacks = {
      onSuccess: () => {
        toast.success(isEditing ? 'Changes saved' : `"${values.name}" was added to your books`);
        onSuccess();
      },
      onError: (error: unknown) => applyServerFieldErrors(error, setError),
    };

    if (book) updateBook.mutate({ id: book.id, payload }, callbacks);
    else createBook.mutate(payload, callbacks);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormField label="Title" htmlFor="book-name" error={errors.name?.message}>
        <Input
          id="book-name"
          placeholder="e.g. The Hobbit"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
      </FormField>

      <FormField label="Author" htmlFor="book-author" error={errors.author?.message}>
        <Input
          id="book-author"
          placeholder="e.g. J.R.R. Tolkien"
          aria-invalid={!!errors.author}
          {...register('author')}
        />
      </FormField>

      <fieldset className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <legend className="text-sm font-medium text-slate-700">
            Cover photo <span className="font-normal text-slate-400">(optional)</span>
          </legend>
          <SegmentedControl
            label="Photo source"
            value={photoSource}
            options={PHOTO_SOURCE_OPTIONS}
            onChange={(source) => setValue('photoSource', source)}
          />
        </div>

        <div className="flex gap-4">
          <BookCover src={previewSrc} alt="Cover preview" className="w-24 shrink-0" />
          <div className="min-w-0 flex-1">
            {photoSource === 'upload' ? (
              <ImageDropzone
                id="book-photo"
                fileName={photo?.name}
                hasError={!!errors.photo}
                onFileSelect={(file) => setValue('photo', file, { shouldValidate: true })}
              />
            ) : (
              <Input
                id="book-photo-url"
                type="url"
                placeholder="https://example.com/cover.jpg"
                aria-label="Image URL"
                aria-invalid={!!errors.photoUrl}
                {...register('photoUrl')}
              />
            )}
            <p className="mt-1.5 text-sm text-red-600" role="alert">
              {photoSource === 'upload' ? errors.photo?.message : errors.photoUrl?.message}
            </p>
            {isEditing && photoSource === 'url' && (
              <p className="text-xs text-slate-500">Leave empty to remove the cover photo.</p>
            )}
          </div>
        </div>
      </fieldset>

      <FormErrorAlert error={saveBook.error} />

      <ModalActions>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={saveBook.isPending}>
          {isEditing ? 'Save changes' : 'Add book'}
        </Button>
      </ModalActions>
    </form>
  );
}
