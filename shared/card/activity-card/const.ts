import { LANGUAGES } from '@const/enums';

export const ACTIVITY_TEXT_MODERATION_COPY = {
  [LANGUAGES.english]: {
    hidden: 'Workout text was hidden by moderation.',
    pendingOwner: 'Workout text is under review and will be visible to others after approval.',
    pendingViewer: 'Workout text is under review.',
    refresh: 'Refresh',
  },
  [LANGUAGES.russian]: {
    hidden: 'Текст тренировки скрыт модерацией.',
    pendingOwner: 'Текст тренировки проверяется. Он будет виден другим после одобрения.',
    pendingViewer: 'Текст тренировки находится на проверке.',
    refresh: 'Обновить',
  },
} as const;
