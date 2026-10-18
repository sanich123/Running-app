import { LANGUAGES } from '../../../constants/enums';

export const CARD_DELETE_BTN = {
  [LANGUAGES.english]: {
    deleteActivity: 'Delete activity?',
    question: 'This action cannot be undone.',
    accept: 'Delete',
    cancel: 'Cancel',
  },
  [LANGUAGES.russian]: {
    deleteActivity: 'Удалить активность?',
    question: 'Это действие нельзя отменить.',
    accept: 'Удалить',
    cancel: 'Отмена',
  },
} as const;

export const CARD_DELETE_BTN_TEST_ID = 'activityCardDeleteBtn';
export const CARD_DELETE_BTN_ICON = 'delete';
