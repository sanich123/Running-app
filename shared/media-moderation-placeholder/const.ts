import { LANGUAGES } from '@const/enums';

export const MEDIA_MODERATION_PLACEHOLDER_COPY = {
  [LANGUAGES.russian]: {
    queued: 'Фото в очереди обработки',
    processing: 'Фото обрабатывается',
    reviewRequired: 'Фото на модерации',
    approved: 'Готовим медиа',
    rejected: 'Медиа не прошло проверку',
    failed: 'Не удалось проверить медиа',
    detail: 'Обычно проверка занимает несколько минут. Ручная проверка может длиться дольше. Обновите ленту позже.',
    retry: 'Файл пока не опубликован. Попробуйте загрузить его ещё раз.',
  },
  [LANGUAGES.english]: {
    queued: 'Photo is queued for processing',
    processing: 'Photo is processing',
    reviewRequired: 'Photo is under moderation',
    approved: 'Preparing media',
    rejected: 'Media did not pass review',
    failed: 'Could not check media',
    detail: 'Checks usually take a few minutes. Manual review can take longer. Refresh the feed later.',
    retry: 'The file is not published. Please try uploading it again.',
  },
} as const;
