import { LANGUAGES } from '@const/enums';

export const MAP_METRICS = {
  [LANGUAGES.english]: {
    time: 'Time',
    pace: 'Pace',
    speed: 'Speed',
    steps: 'Steps',
    cadence: 'Cadence',
    lastKm: 'Last km',
    altitude: 'Elevation gain',
    distance: 'Distance',
    km: 'km',
    kmh: 'km/h',
    spm: 'spm',
    m: 'm',
  },
  [LANGUAGES.russian]: {
    time: 'Время',
    pace: 'Темп',
    speed: 'Скорость',
    steps: 'Шаги',
    cadence: 'Каденс',
    lastKm: 'Последний км',
    altitude: 'Набор высоты',
    distance: 'Дистанция',
    km: 'км',
    kmh: 'км/ч',
    spm: 'шагов/мин',
    m: 'м',
  },
} as const;
