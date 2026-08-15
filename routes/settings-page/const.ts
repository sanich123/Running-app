import { LANGUAGES } from '../../constants/enums';

export const SETTINGS = {
  [LANGUAGES.english]: {
    eng: 'English',
    rus: 'Russian',
    logout: 'Log out',
    cache: 'Clear cache',
    switchOn: 'Switch on',
    switchOff: 'Switch off',
    emailNotifications: 'email notifications',
  },
  [LANGUAGES.russian]: {
    eng: 'Английский',
    rus: 'Русский',
    logout: 'Выйти',
    cache: 'Почистить кэш',
    switchOn: 'Включить',
    switchOff: 'Выключить',
    emailNotifications: 'уведомления по электронной почте',
  },
} as const;
