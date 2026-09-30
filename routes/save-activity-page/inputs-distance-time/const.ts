import { LANGUAGES } from '@const/enums';

export const INPUTS_DISTANCE_TIME = {
  [LANGUAGES.english]: {
    distanceLabel: 'km',
    hoursLabel: 'hours',
    minutesLabel: 'min',
    secondsLabel: 'sec',
    distancePlaceholder: 'km',
    hoursPlaceholder: 'hours',
    minutesPlaceholder: 'min',
    secondsPlaceholder: 'sec',
  },
  [LANGUAGES.russian]: {
    distanceLabel: 'км',
    hoursLabel: 'часы',
    minutesLabel: 'мин',
    secondsLabel: 'сек',
    distancePlaceholder: 'км',
    hoursPlaceholder: 'часы',
    minutesPlaceholder: 'мин',
    secondsPlaceholder: 'сек',
  },
} as const;

export const INPUT_DISTANCE_ID = 'inputDistance';
export const INPUT_HOURS_ID = 'inputHours';
export const INPUT_MINUTES_ID = 'inputMiniutes';
export const INPUT_SECONDS_ID = 'inputSeconds';

export const MANUAL_ACTIVITY_TIME_LIMITS = {
  hours: 48,
  minutes: 59,
  seconds: 59,
} as const;

export const MANUAL_ACTIVITY_TIME_INPUT_MAX_LENGTH = 2;
const MANUAL_ACTIVITY_DISTANCE_MAX = 300;

export function normalizeManualActivityDistanceInput(value: string) {
  if (!value.trim()) {
    return value;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > MANUAL_ACTIVITY_DISTANCE_MAX
    ? String(MANUAL_ACTIVITY_DISTANCE_MAX)
    : value;
}

export function normalizeManualActivityTimeInput(value: string, maxValue: number) {
  const digitsOnly = value.replace(/\D/g, '');

  if (!digitsOnly) {
    return '';
  }

  return String(Math.min(Number(digitsOnly), maxValue));
}
