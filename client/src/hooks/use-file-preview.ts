import { useEffect, useState } from 'react';

interface FilePreview {
  file: File;
  url: string;
}

export function useFilePreview(file: File | undefined): string | undefined {
  const [preview, setPreview] = useState<FilePreview>();

  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview({ file, url: reader.result as string });
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);

  return file && preview?.file === file ? preview.url : undefined;
}
