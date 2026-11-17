import { LANGUAGES } from '@const/enums';
import type { FeedbackTopic } from '@R/services/feedback/feedback';
export type { FeedbackKind, FeedbackTopic } from '@R/services/feedback/feedback';

export const FEEDBACK_TOPICS = [
  'account',
  'workout',
  'sync',
  'maps',
  'groups',
  'other',
] as const satisfies readonly FeedbackTopic[];

export const FEEDBACK_TEXT = {
  [LANGUAGES.english]: {
    faq: [
      {
        question: 'Can I contact support without an account?',
        answer: 'Yes. Enter an email address and we will send your request receipt there.',
      },
      {
        question: 'What should I include in a bug report?',
        answer:
          'Describe what you did, what you expected, and what happened. Device and app details are added automatically.',
      },
      {
        question: 'Can I attach a screenshot?',
        answer: 'Yes. Attach photos or videos to a bug report or feature request.',
      },
      {
        question: 'Why might Runich be unavailable while I use a VPN?',
        answer:
          'A VPN or its network route can block the connection to Runich servers. We cannot change restrictions imposed by a VPN provider or network. Try turning off the VPN or switching networks.',
      },
      {
        question: 'Why can location tracking stop during a workout?',
        answer:
          'Your phone may stop background location updates because of system permissions or battery restrictions. Check location access and background activity settings. We cannot restore route points that the phone did not record.',
      },
    ],
    requestType: 'What can we help with?',
    question: 'Ask a question',
    topic: 'Choose a topic',
    topics: {
      account: 'Account and sign-in',
      workout: 'Workouts and GPS',
      sync: 'Workout sync',
      maps: 'Maps and routes',
      groups: 'Groups and community',
      other: 'Something else',
    },
    email: 'Reply email',
    emailHint: 'We will use this address to reply to your request.',
    emailRequired: 'Enter your email address to contact support.',
    acceptedTitle: 'We received your request',
    acceptedEmail: 'A confirmation was sent to',
    acceptedEmailFailed: 'Your request is saved, but we could not send the confirmation email.',
    reference: 'Reference',
    close: 'Close',
    sendAnother: 'Send another request',
    bug: 'Report a problem',
    feature: 'Suggest a feature',
    questionPlaceholder: 'Describe your question and include any useful details',
    feedbackText: 'Feedback text',
    bugPlaceholder: 'Describe as precisely as possible how to reproduce the bug',
    featurePlaceholder: 'Describe the feature you would like',
    photoUploaded: 'Files uploaded',
    addPhoto: 'Add a photo or video',
    removeAttachment: 'Remove attachment',
    send: 'Send',
    openGalleryError: 'Could not open the gallery',
    attachmentUploadError: 'Could not upload the attachment',
    submitError: 'Could not send feedback',
  },
  [LANGUAGES.russian]: {
    faq: [
      {
        question: 'Можно обратиться без аккаунта?',
        answer: 'Да. Укажи email — на него придёт подтверждение, что обращение принято.',
      },
      {
        question: 'Что написать в сообщении об ошибке?',
        answer:
          'Опиши, что ты делал, что ожидал увидеть и что произошло. Модель устройства и версию приложения мы приложим автоматически.',
      },
      {
        question: 'Можно приложить скриншот?',
        answer: 'Да. К сообщению об ошибке или предложению можно приложить фото или видео.',
      },
      {
        question: 'Почему Runich может не работать с VPN?',
        answer:
          'VPN или маршрут сети через VPN может блокировать соединение с серверами Runich. Мы не можем повлиять на ограничения VPN-сервиса или сети. Попробуй отключить VPN или подключиться к другой сети.',
      },
      {
        question: 'Почему геопозиция может перестать записываться во время тренировки?',
        answer:
          'Телефон может остановить обновление геопозиции в фоне из-за системных разрешений или ограничений энергосбережения. Проверь доступ к геопозиции и работу приложения в фоне. Мы не можем восстановить точки маршрута, которые телефон не записал.',
      },
    ],
    requestType: 'Чем помочь?',
    question: 'Задать вопрос',
    topic: 'Выбери тему',
    topics: {
      account: 'Аккаунт и вход',
      workout: 'Тренировки и GPS',
      sync: 'Синхронизация тренировок',
      maps: 'Карты и маршруты',
      groups: 'Группы и сообщество',
      other: 'Другое',
    },
    email: 'Email для ответа',
    emailHint: 'Используем адрес только для ответа на обращение.',
    emailRequired: 'Укажи email, чтобы мы могли ответить.',
    acceptedTitle: 'Мы получили обращение',
    acceptedEmail: 'Подтверждение отправлено на адрес',
    acceptedEmailFailed: 'Обращение сохранено, но письмо-подтверждение отправить не удалось.',
    reference: 'Номер обращения',
    close: 'Закрыть',
    sendAnother: 'Отправить ещё одно обращение',
    bug: 'Сообщить об ошибке',
    feature: 'Предложить функцию',
    questionPlaceholder: 'Опиши вопрос и добавь детали, которые помогут разобраться',
    feedbackText: 'Текст обратной связи',
    bugPlaceholder: 'Максимально точно опишите, при каком сценарии можно воспроизвести баг',
    featurePlaceholder: 'Опишите желаемую функцию',
    photoUploaded: 'Файлы загружены',
    addPhoto: 'Добавить фото или видео',
    removeAttachment: 'Удалить вложение',
    send: 'Послать',
    openGalleryError: 'Не удалось открыть галерею',
    attachmentUploadError: 'Не удалось загрузить вложение',
    submitError: 'Не удалось отправить обратную связь',
  },
} as const;
