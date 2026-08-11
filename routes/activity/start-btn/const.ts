import { LANGUAGES } from '@const/enums';

export const ACTIVITY_START_BTN_TEST_ID = 'startButton';
export const STOP_ICON = 'stopIcon';

export const ACTIVITY_START_BTN = {
  [LANGUAGES.english]: {
    start: 'START',
  },
  [LANGUAGES.russian]: {
    start: 'СТАРТ',
  },
} as const;
