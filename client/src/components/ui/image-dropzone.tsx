import { ImageUp } from 'lucide-react';
import { useState, type DragEvent } from 'react';
import { cn } from '@/lib/cn';
import { ACCEPTED_IMAGE_TYPES } from '@/lib/validation';

interface ImageDropzoneProps {
  id: string;
  fileName?: string;
  hasError?: boolean;
  onFileSelect: (file: File) => void;
}

export function ImageDropzone({ id, fileName, hasError, onFileSelect }: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <label
      htmlFor={id}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex h-full min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
        isDragging
          ? 'border-primary-500 bg-primary-50'
          : 'hover:border-primary-400 border-slate-300',
        hasError && 'border-red-400',
      )}
    >
      <ImageUp className="mb-2 size-6 text-slate-400" aria-hidden />
      <span className="text-sm font-medium text-primary-600">
        {fileName ? 'Choose another image' : 'Click to upload'}
        <span className="font-normal text-slate-500"> or drag and drop</span>
      </span>
      <span className="mt-1 max-w-full truncate text-xs text-slate-500">
        {fileName ?? 'PNG, JPG, WEBP or GIF up to 5 MB'}
      </span>
      <input
        id={id}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelect(file);
          event.target.value = '';
        }}
      />
    </label>
  );
}
