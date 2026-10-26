import { LANGUAGES } from '@const/enums';

export const MEDIA_REVIEW_STATUSES = {
  queued: 'queued',
  processing: 'processing',
  reviewRequired: 'review_required',
  approved: 'approved',
  rejected: 'rejected',
  failed: 'failed',
} as const;

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

export const MEDIA_MODERATION_PLACEHOLDER_STATUS_CONFIG = {
  [MEDIA_REVIEW_STATUSES.queued]: {
    title: 'queued',
    detail: 'detail',
    isStage: true,
    stageIcon: 'timer-sand',
    statusIcon: 'clock-outline',
  },
  [MEDIA_REVIEW_STATUSES.processing]: {
    title: 'processing',
    detail: 'detail',
    isStage: true,
    stageIcon: 'cog-sync-outline',
    statusIcon: 'clock-outline',
  },
  [MEDIA_REVIEW_STATUSES.reviewRequired]: {
    title: 'reviewRequired',
    detail: 'detail',
    isStage: true,
    stageIcon: 'shield-search',
    statusIcon: 'clock-outline',
  },
  [MEDIA_REVIEW_STATUSES.approved]: {
    title: 'approved',
    detail: 'detail',
    isStage: false,
    statusIcon: 'clock-outline',
  },
  [MEDIA_REVIEW_STATUSES.rejected]: {
    title: 'rejected',
    detail: 'retry',
    isStage: false,
    statusIcon: 'alert-circle-outline',
  },
  [MEDIA_REVIEW_STATUSES.failed]: {
    title: 'failed',
    detail: 'retry',
    isStage: false,
    statusIcon: 'alert-circle-outline',
  },
} as const satisfies Record<
  (typeof MEDIA_REVIEW_STATUSES)[keyof typeof MEDIA_REVIEW_STATUSES],
  {
    title: keyof (typeof MEDIA_MODERATION_PLACEHOLDER_COPY)[LANGUAGES.english];
    detail: 'detail' | 'retry';
    statusIcon: string;
  } & ({ isStage: true; stageIcon: string } | { isStage: false; stageIcon?: never })
>;
