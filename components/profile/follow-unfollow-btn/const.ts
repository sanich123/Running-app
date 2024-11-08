import { LANGUAGES } from '@const/enums';

export const FOLLOW_UNFOLLOW_BTN = {
  [LANGUAGES.english]: {
    follow: 'Follow',
    unfollow: 'Unfollow',
    following: 'Adding...',
    unfollowing: 'Deleting...',
    successUnfollowing: 'You have successfully delete a friend!',
    successFollowing: 'You have successfully add a friend!',
    errorMsg: 'An error',
  },
  [LANGUAGES.russian]: {
    follow: 'Отслеживать',
    unfollow: 'Не отслеживать',
    following: 'Добавляю...',
    unfollowing: 'Удаляю...',
    successUnfollowing: 'Больше не будем отслеживать этого пользователя',
    successFollowing: 'Будем отслеживать этого пользователя',
    errorMsg: 'Ошибка',
  },
};
