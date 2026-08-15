import { LANGUAGES } from '../../../constants/enums';

export const HOME_ACTIVITY_FULL_VIEW_TEST_ID = 'activityFullViewMetricsIndicator';

export const HOME_ACTIVITY_FULL_VIEW = {
  [LANGUAGES.english]: {
    distance: 'Distance',
    averagePace: 'Avg Pace',
    movingTime: 'Moving time',
    elevationGain: 'Elevation gain',
    time: 'Time',
    km: 'km',
    m: 'm',
  },
  [LANGUAGES.russian]: {
    distance: 'Дистанция',
    averagePace: 'Средний темп',
    movingTime: 'Время движения',
    elevationGain: 'Набор высоты',
    km: 'км',
    m: 'м',
  },
} as const;
