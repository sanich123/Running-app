import { LANGUAGES } from '../../constants/enums';

export const ACTIVITY_SAVE_BTN = {
  [LANGUAGES.english]: {
    save: 'Save',
    saving: 'Saving',
    errorMsg: 'An error occured during sending activity! Try again.',
  },
  [LANGUAGES.russian]: {
    save: 'Сохранить',
    saving: 'Сохраняю',
    errorMsg: 'Произошла ошибка во время отправки активности. Попробуйте еще раз!',
  },
} as const;

export const ACTIVITY_SAVE_BTN_TEST_ID = 'activitySaveBtn';
