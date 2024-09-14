import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';

import { LANGUAGES } from '../../../constants/enums';

export const ACTIVITY_CLOSE_BTN: ActivityCloseBtn = {
  [LANGUAGES.russian]: {
    btnText: 'Закрыть',
    alertName: 'Удаление активности',
    alertQuestion: 'Вы уверены?',
    alertAccept: 'Да, я уверен',
  },
  [LANGUAGES.english]: {
    btnText: 'Close',
    alertName: 'Deleting activity',
    alertQuestion: 'Are you sure?',
    alertAccept: 'Yes, I am sure',
  },
} as const;

export type ActivityCloseBtn = {
  [key in LANGUAGES]: {
    [key: string]: string;
  };
};

export const MAP_SPORT_TO_TITLE = {
  [SPORTS_BTNS_VALUES.run]: {
    [LANGUAGES.english]: 'RUNNING',
    [LANGUAGES.russian]: 'БЕГ',
  },
  [SPORTS_BTNS_VALUES.bike]: {
    [LANGUAGES.english]: 'CYCLING',
    [LANGUAGES.russian]: 'ВЕЛОСИПЕД',
  },
  [SPORTS_BTNS_VALUES.swim]: {
    [LANGUAGES.english]: '',
    [LANGUAGES.russian]: '',
  },
};
