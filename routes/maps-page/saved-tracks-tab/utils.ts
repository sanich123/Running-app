import { LANGUAGES } from '@const/enums';

export function formatSavedTrackCount(count: number, language: LANGUAGES) {
  if (language === LANGUAGES.english) return `${count} ${count === 1 ? 'track' : 'tracks'}`;

  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const isOne = lastDigit === 1 && lastTwoDigits !== 11;
  const isFew = lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14);
  const noun = isOne ? 'трек' : isFew ? 'трека' : 'треков';
  return `${count} ${noun}`;
}

export function formatStorageSize(bytes: number, language: LANGUAGES) {
  const isEnglish = language === LANGUAGES.english;
  const formatter = new Intl.NumberFormat(isEnglish ? 'en-US' : 'ru-RU', { maximumFractionDigits: 1 });
  const kilobytes = bytes / 1024;
  const megabytes = kilobytes / 1024;
  if (bytes < 1024) return `${formatter.format(bytes)} ${isEnglish ? 'B' : 'Б'}`;
  if (kilobytes < 1024) return `${formatter.format(kilobytes)} ${isEnglish ? 'KB' : 'КБ'}`;
  return `${formatter.format(megabytes)} ${isEnglish ? 'MB' : 'МБ'}`;
}
