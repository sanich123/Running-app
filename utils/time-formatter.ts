import { LANGUAGES } from '../constants/enums';

function getUtcDurationParts(time: number) {
  const date = new Date(time);
  if (!Number.isFinite(date.getTime())) return null;

  return {
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
    seconds: date.getUTCSeconds(),
  };
}

export function formatDuration(time: number) {
  const parts = getUtcDurationParts(time);
  if (!parts) return 'Invalid date';
  return [parts.hours, parts.minutes, parts.seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

export function formatDurationMinsSecs(time: number) {
  const parts = getUtcDurationParts(time);
  if (!parts) return 'Invalid date';
  return `${String(parts.minutes).padStart(2, '0')}:${String(parts.seconds).padStart(2, '0')}`;
}

export function formatDate(dateString: string, language: LANGUAGES) {
  return new Date(dateString).toLocaleDateString(language === LANGUAGES.english ? 'en-US' : 'ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getHoursMinutes(dateString: string, language: LANGUAGES) {
  const time = new Date(dateString).toLocaleTimeString(language === LANGUAGES.english ? 'en-US' : 'ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${language === LANGUAGES.english ? 'at' : 'в'} ${time}`;
}

export function getMillisecondsFromHoursMinutesSeconds(hours: number, minutes: number, seconds: number) {
  const millisecondsInHour = 3600000;
  const millisecondsInMinute = 60000;
  const millisecondsInSecond = 1000;
  return hours * millisecondsInHour + minutes * millisecondsInMinute + seconds * millisecondsInSecond;
}

export function getHoursMinutesFromMilliseconds(milliseconds: number) {
  const hours = Math.round(milliseconds / 1000 / 60 / 60);
  const difference = milliseconds - hours * 60 * 60 * 1000;
  const minutes = Math.abs(Math.round(difference / 1000 / 60));
  return { hours, minutes };
}

export function getHoursMinutesSecondsFromMilliseconds(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const secondsInHour = 60 * 60;
  const secondsInMinute = 60;
  const hours = Math.floor(totalSeconds / secondsInHour);
  const minutes = Math.floor((totalSeconds % secondsInHour) / secondsInMinute);
  const seconds = totalSeconds % secondsInMinute;

  return { hours, minutes, seconds };
}
