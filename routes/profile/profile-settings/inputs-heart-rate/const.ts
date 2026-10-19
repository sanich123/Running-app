import { LANGUAGES } from '@const/enums';

export const HEART_RATE_INPUTS = {
  [LANGUAGES.english]: {
    sectionTitle: 'Heart rate zones',
    sectionHint: 'Used to calculate heart-rate zones in your activities',
    restingLabel: 'Resting heart rate (bpm)',
    restingPlaceholder: 'e.g. 55',
    maximumLabel: 'Maximum heart rate (bpm)',
    maximumPlaceholder: 'e.g. 190',
  },
  [LANGUAGES.russian]: {
    sectionTitle: 'Зоны пульса',
    sectionHint: 'Эти значения используются для расчёта зон пульса в тренировках',
    restingLabel: 'Пульс в покое (уд/мин)',
    restingPlaceholder: 'Например, 55',
    maximumLabel: 'Максимальный пульс (уд/мин)',
    maximumPlaceholder: 'Например, 190',
  },
} as const;

export const RESTING_HEART_RATE_TEST_ID = 'inputRestingHeartRate';
export const MAX_HEART_RATE_TEST_ID = 'inputMaxHeartRate';
