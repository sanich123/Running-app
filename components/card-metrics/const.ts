import { LANGUAGES } from '../../constants/enums';

export const CARD_METRICS = {
  [LANGUAGES.english]: {
    distance: 'Distance',
    pace: 'Pace',
    time: 'Time',
    km: 'km',
  },
  [LANGUAGES.russian]: {
    distance: 'Дистанция',
    pace: 'Темп',
    time: 'Время',
    km: 'км',
  },
} as const;
