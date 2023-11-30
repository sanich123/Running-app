import { LANGUAGES, STATUSES } from '../../constants/enums';

const { initial, started, paused, continued } = STATUSES;

export const ACTIVITY_START_BTN_TEST_ID = 'startButton';
export const STOP_ICON = 'stopIcon';

export const ACTIVITY_START_BTN = {
  [LANGUAGES.english]: {
    start: 'RUN',
    finish: 'FINISH',
  },
  [LANGUAGES.russian]: {
    start: 'RUN',
    finish: 'ЗАКОНЧ.',
  },
} as const;

export const RESPONSE_STATUS: { [key in STATUSES]: STATUSES } = {
  [initial]: started,
  [started]: paused,
  [paused]: initial,
  [continued]: paused,
} as const;
