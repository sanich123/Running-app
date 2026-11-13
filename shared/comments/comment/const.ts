import { LANGUAGES } from '@const/enums';

export const COMMENT_MODERATION_COPY = {
  [LANGUAGES.english]: {
    hidden: 'Comment hidden by moderation',
    hiddenPlaceholder: 'Comment hidden until review.',
    pending: 'Comment under review',
    refresh: 'Refresh',
  },
  [LANGUAGES.russian]: {
    hidden: 'Комментарий скрыт модерацией',
    hiddenPlaceholder: 'Комментарий скрыт до проверки.',
    pending: 'Комментарий на проверке',
    refresh: 'Обновить',
  },
} as const;
