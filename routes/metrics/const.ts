import { LANGUAGES } from '../../constants/enums';

export const MAP_METRICS = {
  [LANGUAGES.english]: {
    time: 'Time',
    pace: 'Pace',
    lastKm: 'Last km',
    altitude: 'Altitude',
    distance: 'Distance',
    km: 'km',
    m: 'm',
  },
  [LANGUAGES.russian]: {
    time: 'Время',
    pace: 'Темп',
    lastKm: 'Последний км',
    altitude: 'Высота',
    distance: 'Дистанция',
    km: 'км',
    m: 'м',
  },
} as const;
