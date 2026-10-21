import { SPORTS_BTNS_VALUES } from '@const/sports';

export const SPORTS_NAMES = [
  { iconName: 'walk', value: SPORTS_BTNS_VALUES.walk },
  { iconName: 'run', value: SPORTS_BTNS_VALUES.run },
  { iconName: 'bike', value: SPORTS_BTNS_VALUES.bike },
  { iconName: 'hiking', value: SPORTS_BTNS_VALUES.hike },
];

export const CHOOSE_SPORT_MODAL_TEXT = {
  russian: {
    title: 'Выберите спорт',
    subtitle: 'Выберите вариант для активности',
    sports: { walk: 'Ходьба', run: 'Бег', bike: 'Велосипед', hike: 'Поход' },
  },
  english: {
    title: 'Choose a sport',
    subtitle: 'Choose an activity type',
    sports: { walk: 'Walking', run: 'Running', bike: 'Cycling', hike: 'Hiking' },
  },
} as const;
