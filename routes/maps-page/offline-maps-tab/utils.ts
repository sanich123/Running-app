export function formatBytes(sizeBytes: number) {
  if (sizeBytes < 1) return '0 MB';
  if (sizeBytes < 1024 ** 2) return `${Math.round(sizeBytes / 1024)} KB`;
  const megabytes = sizeBytes / 1024 ** 2;
  return megabytes < 1000 ? `${megabytes.toFixed(1)} MB` : `${(megabytes / 1024).toFixed(2)} GB`;
}
