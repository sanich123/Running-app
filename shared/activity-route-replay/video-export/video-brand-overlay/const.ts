import { LANGUAGES } from '@const/enums';
import { SPORTS_BTNS_VALUES } from '@const/sports';

export const ACTIVITY_LABELS = {
  [LANGUAGES.english]: {
    [SPORTS_BTNS_VALUES.run]: 'RUN',
    [SPORTS_BTNS_VALUES.walk]: 'WALK',
    [SPORTS_BTNS_VALUES.bike]: 'CYCLING',
    [SPORTS_BTNS_VALUES.ride]: 'CYCLING',
    [SPORTS_BTNS_VALUES.hike]: 'HIKING',
    [SPORTS_BTNS_VALUES.swim]: 'SWIMMING',
    [SPORTS_BTNS_VALUES.workout]: 'WORKOUT',
  },
  [LANGUAGES.russian]: {
    [SPORTS_BTNS_VALUES.run]: 'БЕГ',
    [SPORTS_BTNS_VALUES.walk]: 'ПРОГУЛКА',
    [SPORTS_BTNS_VALUES.bike]: 'ВЕЛОСПОРТ',
    [SPORTS_BTNS_VALUES.ride]: 'ВЕЛОСПОРТ',
    [SPORTS_BTNS_VALUES.hike]: 'ПОХОД',
    [SPORTS_BTNS_VALUES.swim]: 'ПЛАВАНИЕ',
    [SPORTS_BTNS_VALUES.workout]: 'ТРЕНИРОВКА',
  },
} as const;
