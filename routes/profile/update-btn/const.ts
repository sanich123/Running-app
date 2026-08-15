import { LANGUAGES } from '../../../constants/enums';

export const UPDATE_BTN = {
  [LANGUAGES.english]: {
    create: 'Create',
    update: 'Update',
    creating: 'Creating..',
    updating: 'Updating..',
  },
  [LANGUAGES.russian]: {
    create: 'Создать',
    update: 'Обновить',
    creating: 'Создаю..',
    updating: 'Обновляю..',
  },
} as const;

export const UPDATE_BTN_ERROR_MSG = 'An error occured during sending profile info. Try again!';
