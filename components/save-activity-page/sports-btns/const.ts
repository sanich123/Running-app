import { LANGUAGES } from '@const/enums';

export enum SPORTS_BTNS_VALUES {
  run = 'run',
  swim = 'swim',
  bike = 'bike',
  ride = 'ride',
  workout = 'workout',
  hike = 'hike',
  checkAll = 'all',
  walk = 'walk',
}

export const SPORTS_BTNS = {
  [LANGUAGES.english]: {
    labelRun: 'Running',
    labelSwim: 'Swimming',
    labelBike: 'Riding',
  },
  [LANGUAGES.russian]: {
    labelRun: 'Бег',
    labelSwim: 'Плавание',
    labelBike: 'Велосипед',
  },
} as const;

export const RUN_BTN_TEST_ID = 'runningBtn';
export const SWIM_BTN_TEST_ID = 'swimmingBtn';
export const RIDE_BTN_TEST_ID = 'ridingBtn';
