import { LANGUAGES } from '../../constants/enums';

export const FOLLOWERS_COUNT = {
  [LANGUAGES.english]: {
    error: 'An error',
    followers: 'Followers',
  },
  [LANGUAGES.russian]: {
    error: 'Ошибка',
    followers: 'Фолловеры',
  },
} as const;
