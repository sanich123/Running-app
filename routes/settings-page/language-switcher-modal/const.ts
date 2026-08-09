import { LANGUAGES } from '@const/enums';

export const LANGUAGES_ARRAY = {
  [LANGUAGES.russian]: {
    values: [
      { value: LANGUAGES.english, title: 'Английский' },
      { value: LANGUAGES.russian, title: 'Русский' },
    ],
  },
  [LANGUAGES.english]: {
    values: [
      { value: LANGUAGES.english, title: 'English' },
      { value: LANGUAGES.russian, title: 'Russian' },
    ],
  },
};
