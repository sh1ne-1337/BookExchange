export function isUploadedImage(url: string | null | undefined): boolean {
  return !!url?.startsWith('/uploads/');
}
