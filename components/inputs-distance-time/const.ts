import { LANGUAGES } from '../../constants/enums';

export const INPUTS_DISTANCE_TIME = {
  [LANGUAGES.english]: {
    distanceLabel: 'Km',
    hoursLabel: 'Hours',
    minutesLabel: 'Minutes',
    distancePlaceholder: 'Distance',
    hoursPlaceholder: 'Hours',
    minutesPlaceholder: 'Minutes',
  },
  [LANGUAGES.russian]: {
    distanceLabel: 'Км',
    hoursLabel: 'Часы',
    minutesLabel: 'Минуты',
    distancePlaceholder: 'Дистанция',
    hoursPlaceholder: 'Часы',
    minutesPlaceholder: 'Минуты',
  },
} as const;

export const INPUT_DISTANCE_ID = 'inputDistance';
export const INPUT_HOURS_ID = 'inputHours';
export const INPUT_MINUTES_ID = 'inputMiniutes';
