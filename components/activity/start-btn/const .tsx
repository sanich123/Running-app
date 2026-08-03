import { LANGUAGES, STATUSES } from '@const/enums';

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

export const RESPONSE_STATUS = {
  [STATUSES.initial]: STATUSES.started,
  [STATUSES.started]: STATUSES.paused,
  [STATUSES.paused]: STATUSES.initial,
  [STATUSES.continued]: STATUSES.paused,
} as const;
