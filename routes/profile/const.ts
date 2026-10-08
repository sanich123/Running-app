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
    description: 'Import completed workouts from Health Connect or Apple Health.',
  },
  [LANGUAGES.russian]: {
    title: 'Подключить часы',
    description: 'Импортировать завершённые тренировки из Health Connect или Apple Health.',
  },
} as const;
