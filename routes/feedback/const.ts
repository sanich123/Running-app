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
    photoSelected: 'Photo selected',
    addPhoto: 'Add a photo or video',
    send: 'Send',
    openGalleryError: 'Could not open the gallery',
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
    photoSelected: 'Фото выбрано',
    addPhoto: 'Добавить фото или видео',
    send: 'Послать',
    openGalleryError: 'Не удалось открыть галерею',
    submitError: 'Не удалось отправить обратную связь',
  },
} as const;
