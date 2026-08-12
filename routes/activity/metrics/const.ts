import { LANGUAGES } from '@const/enums';

export const MAP_METRICS = {
  [LANGUAGES.english]: {
    time: 'Time',
    pace: 'Pace',
    lastKm: 'Last km',
    altitude: 'Elevation gain',
    distance: 'Distance',
    km: 'km',
    m: 'm',
  },
  [LANGUAGES.russian]: {
    time: 'Время',
    pace: 'Темп',
    lastKm: 'Последний км',
    altitude: 'Набор высоты',
    distance: 'Дистанция',
    km: 'км',
    m: 'м',
  },
} as const;
