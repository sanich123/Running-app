import { LANGUAGES } from '../../constants/enums';

export const SETTINGS = {
  [LANGUAGES.english]: {
    eng: 'English',
    rus: 'Russian',
    logout: 'Log out',
    cache: 'Clean cache',
    switchOn: 'Switch on',
    switchOff: 'Switch off',
    prefetch: 'prefetching activities in a feed',
    emailNotifications: 'email notifications',
  },
  [LANGUAGES.russian]: {
    eng: 'Английский',
    rus: 'Русский',
    logout: 'Выйти',
    cache: 'Почистить кэш',
    switchOn: 'Включить',
    switchOff: 'Выключить',
    prefetch: 'предзагрузку тренировок в ленте',
    emailNotifications: 'уведомления по электронной почте',
  },
} as const;
