import { LANGUAGES } from '@const/enums';

export const ADMIN_DASHBOARD_COPY = {
  [LANGUAGES.russian]: {
    loading: 'Проверяем права доступа…',
    moderation: 'Модерация',
    access: 'Права доступа',
    emailOnly: 'У вас есть право отправлять email. Этот раздел админки пока не подключён.',
  },
  [LANGUAGES.english]: {
    loading: 'Checking access…',
    moderation: 'Moderation',
    access: 'Access rights',
    emailOnly: 'You can send email. This admin section is not connected yet.',
  },
} as const;
