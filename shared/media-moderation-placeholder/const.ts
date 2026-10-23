import { LANGUAGES } from '@const/enums';

export const MEDIA_MODERATION_PLACEHOLDER_COPY = {
  [LANGUAGES.russian]: {
    queued: 'Ожидает проверки',
    processing: 'Проверяем медиа',
    reviewRequired: 'Передано модератору',
    approved: 'Готовим медиа',
    rejected: 'Медиа не прошло проверку',
    failed: 'Не удалось проверить медиа',
    detail: 'Обычно проверка занимает несколько минут. Ручная проверка может длиться дольше. Обновите ленту позже.',
    retry: 'Файл пока не опубликован. Попробуйте загрузить его ещё раз.',
  },
  [LANGUAGES.english]: {
    queued: 'Waiting for review',
    processing: 'Checking media',
    reviewRequired: 'Sent to a moderator',
    approved: 'Preparing media',
    rejected: 'Media did not pass review',
    failed: 'Could not check media',
    detail: 'Checks usually take a few minutes. Manual review can take longer. Refresh the feed later.',
    retry: 'The file is not published. Please try uploading it again.',
  },
} as const;
