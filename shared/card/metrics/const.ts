import { LANGUAGES } from '../../../constants/enums';

export const CARD_METRICS = {
  [LANGUAGES.english]: {
    distance: 'Distance',
    elevation: 'Elevation gain',
    pace: 'Pace',
    speed: 'Speed',
    steps: 'Steps',
    time: 'Time',
    km: 'km',
    kmh: 'km/h',
    m: 'm',
  },
  [LANGUAGES.russian]: {
    distance: 'Дистанция',
    elevation: 'Набор высоты',
    pace: 'Темп',
    speed: 'Скорость',
    steps: 'Шаги',
    time: 'Время',
    km: 'км',
    kmh: 'км/ч',
    m: 'м',
  },
} as const;
