import { LANGUAGES } from '@const/enums';

export const BLOCKED_USERS_COPY = {
  [LANGUAGES.english]: {
    empty: 'You have not blocked anyone.',
    fallbackName: 'Runich user',
    unblock: 'Unblock',
    unblocked: 'User unblocked.',
    error: 'Could not unblock this user.',
  },
  [LANGUAGES.russian]: {
    empty: 'Вы пока никого не заблокировали.',
    fallbackName: 'Пользователь Runich',
    unblock: 'Разблокировать',
    unblocked: 'Пользователь разблокирован.',
    error: 'Не удалось разблокировать пользователя.',
  },
} as const;
