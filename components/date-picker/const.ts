import { LANGUAGES } from '../../constants/enums';

export const DATE_TIME_PICKER = {
  [LANGUAGES.english]: {
    title: 'Choose date and time',
    confirm: 'Accept',
    cancel: 'Cancel',
  },
  [LANGUAGES.russian]: {
    title: 'Выберите дату и время',
    confirm: 'Выбрать',
    cancel: 'Отменить',
  },
} as const;

export const DATE_TIME_PICKER_BTN_ID = 'dateTimePickerBtn';
