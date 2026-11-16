import { LANGUAGES } from '@const/enums';
import type { AdminFeedbackStatus } from '@R/services/admin/types';

export const ADMIN_FEEDBACK_STATUSES: readonly AdminFeedbackStatus[] = ['open', 'in_progress', 'resolved'];

export const ADMIN_FEEDBACK_COPY = {
  [LANGUAGES.russian]: {
    title: 'Обращения',
    open: 'Новые',
    in_progress: 'В работе',
    resolved: 'Закрытые',
    empty: 'В этой очереди пока нет обращений.',
    question: 'Вопрос',
    bug: 'Ошибка',
    feature: 'Предложение',
    other: 'Обращение',
    topic: 'Тема',
    topics: {
      account: 'Аккаунт и вход',
      workout: 'Тренировки и GPS',
      sync: 'Синхронизация тренировок',
      maps: 'Карты и маршруты',
      groups: 'Группы и сообщество',
      other: 'Другое',
    },
    device: 'Устройство и приложение',
    attachments: 'Вложения',
    replyLabel: 'Текст ответа',
    sendReply: 'Отправить ответ',
    replySent: 'Ответ отправлен',
    replyError: 'Не удалось отправить ответ',
    replyHistory: 'История ответов',
    replyPending: 'Отправляется',
    replyDelivered: 'Отправлен',
    replyFailed: 'Письмо не отправлено',
    start: 'Взять в работу',
    resolve: 'Закрыть обращение',
    reopen: 'Вернуть в новые',
    updated: 'Статус обращения обновлён',
    updateError: 'Не удалось обновить обращение',
    linkError: 'Не удалось открыть вложение',
  },
  [LANGUAGES.english]: {
    title: 'Support requests',
    open: 'New',
    in_progress: 'In progress',
    resolved: 'Closed',
    empty: 'There are no requests in this queue.',
    question: 'Question',
    bug: 'Bug report',
    feature: 'Feature request',
    other: 'Request',
    topic: 'Topic',
    topics: {
      account: 'Account and sign-in',
      workout: 'Workouts and GPS',
      sync: 'Workout sync',
      maps: 'Maps and routes',
      groups: 'Groups and community',
      other: 'Other',
    },
    device: 'Device and app',
    attachments: 'Attachments',
    replyLabel: 'Reply text',
    sendReply: 'Send reply',
    replySent: 'Reply sent',
    replyError: 'Could not send reply',
    replyHistory: 'Reply history',
    replyPending: 'Sending',
    replyDelivered: 'Sent',
    replyFailed: 'Email not sent',
    start: 'Start working',
    resolve: 'Close request',
    reopen: 'Move to new',
    updated: 'Request status updated',
    updateError: 'Could not update request',
    linkError: 'Could not open the attachment',
  },
} as const;

export function getAdminFeedbackKindLabel(
  kind: string,
  copy: (typeof ADMIN_FEEDBACK_COPY)[keyof typeof ADMIN_FEEDBACK_COPY],
) {
  if (kind === 'question') return copy.question;
  if (kind === 'bug') return copy.bug;
  if (kind === 'feature') return copy.feature;
  return copy.other;
}
