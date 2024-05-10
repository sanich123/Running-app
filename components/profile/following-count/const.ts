import { LANGUAGES } from '../../../constants/enums';

export const FOLLOWING_COUNT = {
  [LANGUAGES.english]: {
    error: 'An error',
    followings: 'Following',
  },
  [LANGUAGES.russian]: {
    error: 'Ошибка',
    followings: 'Отслеж.',
  },
} as const;
