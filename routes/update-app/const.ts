import { LANGUAGES } from '@const/enums';

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
