export const FILE_SENDING_ERROR_COPY = {
  invalidVideoFormat: 'Поддерживаются только видео MP4, MOV и WebM',
  invalidImageFormat: 'Такое разрешение нельзя использовать для изображения',
  compressionFailed: {
    video: 'Ошибка во время сжатия видео',
    image: 'Ошибка во время сжатия изображения',
  },
  uploadFailed: 'Не удалось загрузить медиафайл',
  uploadsFailed: 'Не удалось загрузить медиафайлы',
  videoDurationUnavailable: 'Не удалось определить длительность видео',
  videoDurationExceeded: 'Длительность видео должна быть не более 1 минуты',
  videoSizeExceeded: 'Размер видео должен быть не более 50 МБ',
  galleryOpenFailed: 'Не удалось открыть галерею',
  videoModerationNotice: {
    russian: 'Медиа отправлено модератору. Загрузка продолжится после проверки',
    english: 'Media sent to moderation. Upload will continue after review',
  },
  mediaRejected: 'Модератор отклонил часть медиафайлов',
  mediaReviewFailed: 'Не удалось проверить часть медиафайлов. Они не будут прикреплены',
} as const;
