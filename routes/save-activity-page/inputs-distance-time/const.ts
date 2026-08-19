import { LANGUAGES } from '@const/enums';

export const INPUTS_DISTANCE_TIME = {
  [LANGUAGES.english]: {
    distanceLabel: 'Km',
    hoursLabel: 'Hours',
    minutesLabel: 'Minutes',
    secondsLabel: 'Seconds',
    distancePlaceholder: 'Distance',
    hoursPlaceholder: 'Hours',
    minutesPlaceholder: 'Minutes',
    secondsPlaceholder: 'Seconds',
  },
  [LANGUAGES.russian]: {
    distanceLabel: 'Км',
    hoursLabel: 'Часы',
    minutesLabel: 'Минуты',
    secondsLabel: 'Секунды',
    distancePlaceholder: 'Дистанция',
    hoursPlaceholder: 'Часы',
    minutesPlaceholder: 'Минуты',
    secondsPlaceholder: 'Секунды',
  },
} as const;

export const INPUT_DISTANCE_ID = 'inputDistance';
export const INPUT_HOURS_ID = 'inputHours';
export const INPUT_MINUTES_ID = 'inputMiniutes';
export const INPUT_SECONDS_ID = 'inputSeconds';
