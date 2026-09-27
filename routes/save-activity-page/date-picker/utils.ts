import { LANGUAGES } from '@const/enums';

export function clampDateToMaximum(date: Date, maximumDate?: Date) {
  return maximumDate && date > maximumDate ? maximumDate : date;
}

export function setTimeOnDate(date: Date, hours: number, minutes: number) {
  const dateWithTime = new Date(date);
  dateWithTime.setHours(hours, minutes, 0, 0);
  return dateWithTime;
}

export function formatSelectedDate(date: Date, language: LANGUAGES) {
  const locale = language === LANGUAGES.english ? 'en-US' : 'ru-RU';
  const dateLabel = date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const timeLabel = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });

  return `${dateLabel} • ${timeLabel}`;
}
