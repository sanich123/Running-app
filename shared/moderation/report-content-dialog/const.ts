import { LANGUAGES } from '@const/enums';
import type { ContentReportReason, UserReportTargetType } from '@R/services/moderation/types';

export const REPORT_CONTENT_COPY = {
  [LANGUAGES.english]: {
    title: 'Report content',
    prompt: {
      activity: 'What exactly is wrong with this activity?',
      comment: 'What exactly is wrong with this comment?',
      media: 'What exactly is wrong with this photo?',
      user: 'What exactly is wrong with this profile?',
    } satisfies Record<UserReportTargetType, string>,
    details: 'Additional details (optional)',
    requiredDetails: 'Describe in detail *',
    requiredDetailsHint: 'For “Something else”, describe exactly what violates the rules.',
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
    prompt: {
      activity: 'Укажите, что именно вам не нравится в этой тренировке',
      comment: 'Укажите, что именно вам не нравится в этом комментарии',
      media: 'Укажите, что именно вам не нравится в этом фото',
      user: 'Укажите, что именно вам не нравится в профиле пользователя',
    } satisfies Record<UserReportTargetType, string>,
    details: 'Дополнительные сведения (необязательно)',
    requiredDetails: 'Опишите подробнее *',
    requiredDetailsHint: 'Для причины «Другое» опишите, что именно нарушает правила.',
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
