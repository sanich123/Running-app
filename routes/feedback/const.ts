import { LANGUAGES } from '@const/enums';

export type FeedbackKind = 'bug' | 'thanks' | 'feature';

export const FEEDBACK_TEXT = {
  [LANGUAGES.english]: {
    title: 'Feedback',
    intro: 'Tell us what you would like to share with the developer.',
    bug: 'Report a bug',
    thanks: 'Thank the developer',
    feature: 'Request a feature',
    beforeSend: 'Before sending',
    freeService: 'Runich is completely free to use',
    soloDeveloper: 'Runich was written and is maintained by one developer in their spare time',
    feedbackText: 'Feedback text',
    bugPlaceholder: 'Describe as precisely as possible how to reproduce the bug',
    featurePlaceholder: 'Describe the feature you would like',
    thanksPlaceholder: 'Write a message to the developer',
    photoUploaded: 'Files uploaded',
    attachmentLimit:
      'You can add up to 10 photos or videos under 100 MB total. Uploading 10 files may take a while — check your connection speed.',
    addPhoto: 'Add a photo or video',
    removeAttachment: 'Remove attachment',
    send: 'Send',
    openGalleryError: 'Could not open the gallery',
    attachmentUploadError: 'Could not upload the attachment',
    submitError: 'Could not send feedback',
  },
  [LANGUAGES.russian]: {
    title: 'Обратная связь',
    intro: 'Выбери, чем хочешь поделиться с разработчиком.',
    bug: 'Поведать о баге',
    thanks: 'Поблагодарить разработчика',
    feature: 'Хочу фичу',
    beforeSend: 'Перед отправкой',
    freeService: 'Runich полностью бесплатный сервис',
    soloDeveloper: 'Runich полностью был написан и поддерживается одним разработчиком в свободное от работы время',
    feedbackText: 'Текст обратной связи',
    bugPlaceholder: 'Максимально точно опишите, при каком сценарии можно воспроизвести баг',
    featurePlaceholder: 'Опишите желаемую функцию',
    thanksPlaceholder: 'Напишите сообщение разработчику',
    photoUploaded: 'Файлы загружены',
    attachmentLimit:
      'Можно добавить до 10 фото или видео общим размером менее 100 МБ. Загрузка 10 файлов может занять время — обрати внимание на скорость соединения.',
    addPhoto: 'Добавить фото или видео',
    removeAttachment: 'Удалить вложение',
    send: 'Послать',
    openGalleryError: 'Не удалось открыть галерею',
    attachmentUploadError: 'Не удалось загрузить вложение',
    submitError: 'Не удалось отправить обратную связь',
  },
} as const;
