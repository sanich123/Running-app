import { utc, duration } from 'moment';
import { LANGUAGES } from '../constants/enums';

export function formatDuration(time: number) {
  return utc(duration(time, 'ms').asMilliseconds()).format('HH:mm:ss');
}

export function formatDurationMinsSecs(time: number) {
  return utc(duration(time, 'ms').asMilliseconds()).format('mm:ss');
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

export function getMillisecondsFromHoursMinutes(hours: number, minutes: number) {
  const millisecondsInHour = 3600000;
  const millisecondsInMinute = 60000;
  return hours * millisecondsInHour + minutes * millisecondsInMinute;
}

export function getHoursMinutesFromMilliseconds(milliseconds: number) {
  const hours = Math.round(milliseconds / 1000 / 60 / 60);
  const difference = milliseconds - hours * 60 * 60 * 1000;
  const minutes = Math.abs(Math.round(difference / 1000 / 60));
  return { hours, minutes };
}
