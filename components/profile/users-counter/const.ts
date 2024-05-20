import { LANGUAGES } from '../../../constants/enums';

export const USERS_COUNT = {
  [LANGUAGES.english]: {
    error: 'An error',
    followers: 'Followers',
    followings: 'Following',
  },
  [LANGUAGES.russian]: {
    error: 'Ошибка',
    followers: 'Фолловеры',
    followings: 'Отслеж.',
  },
} as const;

export enum USERS_VARIANT {
  whoFollowsUser = 'whoFollowsUser',
  whoUserFollows = 'whoUserFollows',
}
