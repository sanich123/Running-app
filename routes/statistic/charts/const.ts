import { LANGUAGES } from '@const/enums';
import { ChooseMetricsBtnsValues } from './types';

export const getMetricsBtnsValues = (language: LANGUAGES) => [
  { value: ChooseMetricsBtnsValues.distance, label: METRICS_BTNS_VALUES[language].distance, showSelectedCheck: true },
  {
    value: ChooseMetricsBtnsValues.amount,
    label: METRICS_BTNS_VALUES[language].activities,
    showSelectedCheck: true,
  },
  { value: ChooseMetricsBtnsValues.duration, label: METRICS_BTNS_VALUES[language].duration, showSelectedCheck: true },
];

export const METRICS_TITLES = {
  [LANGUAGES.russian]: {
    distance: 'Километры',
    activities: 'Тренировки',
    duration: 'Время',
  },
  [LANGUAGES.english]: {
    distance: 'Kilometres',
    activities: 'Activities',
    duration: 'Time',
  },
};

const METRICS_BTNS_VALUES = {
  [LANGUAGES.russian]: {
    distance: 'Расстояние',
    activities: 'Тренировки',
    duration: 'Время',
  },
  [LANGUAGES.english]: {
    distance: 'Distance',
    activities: 'Items',
    duration: 'Duration',
  },
};
