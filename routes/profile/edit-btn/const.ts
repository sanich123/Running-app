import { LANGUAGES } from '../../../constants/enums';

export const EDIT_BTN = {
  [LANGUAGES.english]: {
    edit: 'Edit',
    create: 'Create',
  },
  [LANGUAGES.russian]: {
    edit: 'Редактировать',
    create: 'Создать',
  },
} as const;
