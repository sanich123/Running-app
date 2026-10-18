export function formatShareDate(date: string, duration: number, isRussian: boolean) {
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) return '';

  const end = new Date(start.getTime() + Math.max(0, duration));
  const locale = isRussian ? 'ru-RU' : 'en-US';
  const dateLabel = start.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (value: Date) =>
    value.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });

  return `${dateLabel}, ${formatTime(start)}–${formatTime(end)}`;
}
