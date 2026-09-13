import { LANGUAGES } from '@const/enums';
import { EMAIL_DELIVERY_NOTICE } from '@const/email-delivery';

export const CONFIRM_EMAIL_PAGE_TEXT = {
  [LANGUAGES.english]: {
    title: 'Check your email',
    description: (email: string) => `Enter the confirmation code from the email sent to ${email} to continue.`,
    spam: EMAIL_DELIVERY_NOTICE[LANGUAGES.english],
  },
  [LANGUAGES.russian]: {
    title: 'Проверьте почту',
    description: (email: string) =>
      `Введите код подтверждения из письма, отправленного на адрес ${email}, чтобы продолжить.`,
    spam: EMAIL_DELIVERY_NOTICE[LANGUAGES.russian],
  },
} as const;
