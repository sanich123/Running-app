import { LANGUAGES } from '@const/enums';

export const MOCK_MARKET_URLS = {
  ios: 'https://example.com/runich-app-store',
  android: 'https://example.com/runich-google-play',
  default: 'https://example.com/runich-market',
} as const;

export const UPDATE_APP_TEXT = {
  [LANGUAGES.english]: {
    title: 'Update required',
    description: 'Your app version is outdated. Update the app to continue.',
    action: 'Go to store',
  },
  [LANGUAGES.russian]: {
    title: 'Требуется обновление',
    description: 'Версия приложения устарела. Обновите приложение, чтобы продолжить работу.',
    action: 'Перейти в маркет',
  },
} as const;
