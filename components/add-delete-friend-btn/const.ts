import { LANGUAGES } from '../../constants/enums';

export const ADD_DELETE_FRIEND_BTN = {
  [LANGUAGES.english]: {
    follow: 'Follow',
    unfollow: 'Unfollow',
    following: 'Adding...',
    unfollowing: 'Deleting...',
    successUnfollowing: 'You have successfully delete a friend!',
    successFollowing: 'You have successfully add a friend!',
    errorMsg: 'An error occured',
  },
  [LANGUAGES.russian]: {
    follow: 'Отслеживать',
    unfollow: 'Не отслеживать',
    following: 'Добавляю...',
    unfollowing: 'Удаляю...',
    successUnfollowing: 'Удалили этого пидора из друзей. Так держать!',
    successFollowing: 'Добавили этого пидора в друзей. Так держать!',
    errorMsg: 'Произошла ошибка',
  },
};
