export function getFirstImageFile(files: Iterable<File> | null | undefined): File | null {
  if (!files) return null;

  for (const file of files) {
    if (file.type.startsWith("image/")) return file;
  }

  return null;
}
