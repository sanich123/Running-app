import { LANGUAGES } from '@const/enums';

export interface ActivityDateFilters {
  month: number | null;
  day: number | null;
  year: number | null;
}

export function formatRouteActivityDate(date: string, language: LANGUAGES) {
  return new Date(date).toLocaleDateString(language === LANGUAGES.english ? 'en-US' : 'ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
