export function getAvatarLabel(name?: string | null, surname?: string | null) {
  return [name, surname]
    .map((value) => value?.trim().charAt(0))
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
