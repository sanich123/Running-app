import { LANGUAGES } from '@const/enums';

export const SHARE_BUTTON_TEXT = {
  [LANGUAGES.english]: {
    webUnavailable: 'Sharing is not available in this browser',
    deviceUnavailable: 'Sharing is not available on this device',
  },
  [LANGUAGES.russian]: {
    webUnavailable: 'Функция поделиться не работает в этом браузере',
    deviceUnavailable: 'Функция поделиться не работает на этом устройстве',
  },
} as const;
