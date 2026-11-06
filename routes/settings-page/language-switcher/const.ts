import { LANGUAGES } from '@const/enums';

export const LANGUAGE_SWITCHER_COPY = {
  [LANGUAGES.russian]: {
    title: 'Язык',
    description: 'Выберите язык приложения',
    russianLanguageName: 'Русский',
    englishLanguageName: 'Английский',
  },
  [LANGUAGES.english]: {
    title: 'Language',
    description: 'Choose app language',
    russianLanguageName: 'Russian',
    englishLanguageName: 'English',
  },
} as const;
