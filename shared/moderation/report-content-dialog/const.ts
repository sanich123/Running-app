import { LANGUAGES } from '@const/enums';
import type { ContentReportReason } from '@R/services/moderation/types';

export const REPORT_CONTENT_COPY = {
  [LANGUAGES.english]: {
    title: 'Report content',
    prompt: 'Why are you reporting this?',
    details: 'Additional details (optional)',
    profileDetails: 'Which profile field violates the rules?',
    profileDetailsHint: 'Photo, name, surname, or bio.',
    submit: 'Send report',
    cancel: 'Cancel',
    sent: 'Thank you. Your report was sent to the moderation team.',
    error: 'Could not send the report.',
    reasons: {
      threats: 'Threats',
      harassment: 'Harassment or bullying',
      hate_speech: 'Hate speech',
      sexual_content: 'Sexual content',
      violence: 'Violence',
      spam: 'Spam or misleading content',
      other: 'Something else',
    } satisfies Record<ContentReportReason, string>,
  },
  [LANGUAGES.russian]: {
    title: 'Пожаловаться',
    prompt: 'Укажите причину жалобы',
    details: 'Дополнительные сведения (необязательно)',
    profileDetails: 'Какие данные профиля нарушают правила?',
    profileDetailsHint: 'Фото профиля, имя, фамилия или описание.',
    submit: 'Отправить',
    cancel: 'Отмена',
    sent: 'Жалоба отправлена команде модерации.',
    error: 'Не удалось отправить жалобу.',
    reasons: {
      threats: 'Угрозы',
      harassment: 'Преследование или травля',
      hate_speech: 'Разжигание ненависти',
      sexual_content: 'Сексуальный контент',
      violence: 'Насилие',
      spam: 'Спам или обман',
      other: 'Другое',
    } satisfies Record<ContentReportReason, string>,
  },
} as const;

export const CONTENT_REPORT_REASONS: ContentReportReason[] = [
  'threats',
  'harassment',
  'hate_speech',
  'sexual_content',
  'violence',
  'spam',
  'other',
];
