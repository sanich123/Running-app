import { LANGUAGES } from '../../../constants/enums';

export const HOME_ACTIVITY_FULL_VIEW_TEST_ID = 'activityFullViewMetricsIndicator';

export const HOME_ACTIVITY_FULL_VIEW = {
  [LANGUAGES.english]: {
    distance: 'Distance',
    averagePace: 'Avg Pace',
    averageSpeed: 'Avg speed',
    steps: 'Steps',
    averageCadence: 'Avg cadence',
    movingTime: 'Moving time',
    elevationGain: 'Elevation gain',
    time: 'Time',
    km: 'km',
    kmh: 'km/h',
    spm: 'spm',
    m: 'm',
  },
  [LANGUAGES.russian]: {
    distance: 'Дистанция',
    averagePace: 'Средний темп',
    averageSpeed: 'Средняя скорость',
    steps: 'Шаги',
    averageCadence: 'Средний каденс',
    movingTime: 'Время движения',
    elevationGain: 'Набор высоты',
    km: 'км',
    kmh: 'км/ч',
    spm: 'шагов/мин',
    m: 'м',
  },
} as const;
