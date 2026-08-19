export function toDateTimeInputValue(value: Date | string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const pad = (part: number) => `${part}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}
