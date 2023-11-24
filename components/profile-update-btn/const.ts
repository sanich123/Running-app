import { LANGUAGES } from '../../constants/enums';

export const UPDATE_BTN = {
  [LANGUAGES.english]: {
    update: 'Update',
    updating: 'Updating..',
  },
  [LANGUAGES.russian]: {
    update: 'Обновить',
    updating: 'Обновляю..',
  },
} as const;

export const UPDATE_BTN_ERROR_MSG = 'An error occured during sending profile info. Try again!';
