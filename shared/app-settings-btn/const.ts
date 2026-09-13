import { LANGUAGES } from '@const/enums';

export const APP_SETTINGS_TEXT_BY_LANGUAGE = {
  [LANGUAGES.english]: 'Phone settings',
  [LANGUAGES.russian]: 'Настройки телефона',
} as const;

export const APP_SETTINGS_TEXT = APP_SETTINGS_TEXT_BY_LANGUAGE[LANGUAGES.russian];
