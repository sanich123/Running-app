import { LANGUAGES, STATUSES } from '@const/enums';
import { ReactNode } from 'react';

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

type ResponseStatus = { [key in STATUSES]: STATUSES };
export type ResponseIcon = { [key in STATUSES]: string | ReactNode };

export const RESPONSE_STATUS: ResponseStatus = {
  [STATUSES.initial]: STATUSES.started,
  [STATUSES.started]: STATUSES.paused,
  [STATUSES.paused]: STATUSES.initial,
  [STATUSES.continued]: STATUSES.paused,
} as const;
