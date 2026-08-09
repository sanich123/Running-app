import { LANGUAGES } from '@const/enums';

export const CONFIRM_EMAIL_PAGE_TEXT = {
  [LANGUAGES.english]: {
    title: 'Check your email',
    description: (email: string) => `Enter the confirmation code from the email sent to ${email} to continue.`,
    spam: 'No email yet? Check your Spam or Junk folder and make sure the address is correct.',
  },
  [LANGUAGES.russian]: {
    title: 'Проверьте почту',
    description: (email: string) =>
      `Введите код подтверждения из письма, отправленного на адрес ${email}, чтобы продолжить.`,
    spam: 'Если письма нет, проверьте папку «Спам» и убедитесь, что адрес указан правильно.',
  },
} as const;
