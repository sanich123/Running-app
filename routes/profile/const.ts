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

export const PROFILE_WATCH_IMPORT = {
  [LANGUAGES.english]: {
    title: 'Connect a watch',
    subtitle: '(experimental)',
  },
  [LANGUAGES.russian]: {
    title: 'Подключить часы',
    subtitle: '(экспериментально)',
  },
} as const;
