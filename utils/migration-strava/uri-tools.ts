/** Convert either a filesystem path or an Expo file URI to a file URI. */
export function toFileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${path}`;
}
