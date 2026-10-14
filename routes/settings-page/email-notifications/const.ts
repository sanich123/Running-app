import { LANGUAGES } from '@const/enums';

export const EMAIL_NOTIFICATIONS_COPY = {
  [LANGUAGES.russian]: {
    compactTitle: 'По почте',
    fullTitle: 'Уведомления по почте',
    updateError: 'Не удалось изменить настройки уведомлений',
  },
  [LANGUAGES.english]: {
    compactTitle: 'Email',
    fullTitle: 'Email notifications',
    updateError: 'Could not update email notification settings',
  },
} as const;
