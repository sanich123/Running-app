import { LANGUAGES } from '../../constants/enums';

export const CARD_DELETE_BTN = {
  [LANGUAGES.english]: {
    deleteActivity: 'Deleteing activity',
    question: 'Are you sure?',
    accept: 'Yes, I am sure',
  },
  [LANGUAGES.russian]: {
    deleteActivity: 'Удаление активности',
    question: 'Вы уверены?',
    accept: 'Да, я уверен',
  },
} as const;

export const CARD_DELETE_BTN_TEST_ID = 'activityCardDeleteBtn';
export const CARD_DELETE_BTN_ICON = 'delete';
