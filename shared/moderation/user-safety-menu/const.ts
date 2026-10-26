import { LANGUAGES } from '@const/enums';

export const USER_SAFETY_MENU_COPY = {
  [LANGUAGES.english]: {
    menuLabel: 'User safety options',
    report: 'Report profile',
    block: 'Block user',
    blockTitle: 'Block this user?',
    blockMessage: 'You will no longer see each other’s profiles, activities, or comments.',
    blockConfirm: 'Block',
    cancel: 'Cancel',
    blocked: 'User blocked.',
    blockError: 'Could not block this user.',
  },
  [LANGUAGES.russian]: {
    menuLabel: 'Действия с пользователем',
    report: 'Сообщить о нарушении',
    block: 'Заблокировать пользователя',
    blockTitle: 'Заблокировать пользователя?',
    blockMessage: 'Вы перестанете видеть профили, тренировки и комментарии друг друга.',
    blockConfirm: 'Заблокировать',
    cancel: 'Отмена',
    blocked: 'Пользователь заблокирован.',
    blockError: 'Не удалось заблокировать пользователя.',
  },
} as const;
