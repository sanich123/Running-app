import { LANGUAGES } from '@const/enums';

export const PROFILE_SECTIONS = {
  [LANGUAGES.english]: {
    about: 'About me',
    community: 'Community',
    trainingSummary: 'Training summary',
  },
  [LANGUAGES.russian]: {
    about: 'О себе',
    community: 'Сообщество',
    trainingSummary: 'Общая статистика тренировок',
  },
} as const;
