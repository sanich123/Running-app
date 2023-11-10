import { LANGUAGES } from '../../constants/enums';

export const NAME_SURNAME = {
  [LANGUAGES.english]: {
    namePlaceholder: 'Type your name',
    surnamePlaceholder: 'Type your surname',
  },
  [LANGUAGES.russian]: {
    namePlaceholder: 'Введите ваше имя',
    surnamePlaceholder: 'Введите вашу фамилию',
  },
};

export const NAME_TEST_ID = 'inputName';
export const SURNAME_TEST_ID = 'inputSurname';
