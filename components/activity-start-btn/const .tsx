import { FontAwesome } from '@expo/vector-icons';
import { ReactNode } from 'react';

import { LANGUAGES, STATUSES } from '../../constants/enums';
import { store } from '../../redux/store';

const { initial, started, paused, continued } = STATUSES;

export const ACTIVITY_START_BTN_TEST_ID = 'startButton';

export const ACTIVITY_START_BTN = {
  [LANGUAGES.english]: {
    start: 'RUN',
    finish: 'FINISH',
  },
  [LANGUAGES.russian]: {
    start: 'RUN',
    finish: 'ЗАКОНЧ.',
  },
};

export const RESPONSE_STATUS: { [key in STATUSES]: STATUSES } = {
  [initial]: started,
  [started]: paused,
  [paused]: initial,
  [continued]: paused,
};

export const RESPONSE_ICON: { [key in STATUSES]: string | ReactNode } = {
  [initial]: ACTIVITY_START_BTN[store.getState().language.language].start,
  [started]: <FontAwesome name="stop" size={25} style={{ marginRight: 15 }} />,
  [paused]: ACTIVITY_START_BTN[store.getState().language.language].finish,
  [continued]: <FontAwesome name="stop" size={25} style={{ marginRight: 15 }} />,
};
