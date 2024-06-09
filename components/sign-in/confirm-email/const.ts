import { LANGUAGES } from '@const/enums';

export const CONFIRM_EMAIL = {
  [LANGUAGES.english]: {
    emailConfirmed: 'Thank you! Your email has been confirmed! Now you can log in using your email',
  },
  [LANGUAGES.russian]: {
    emailConfirmed: 'Спасибо! Ваша почта подтверждена. Теперь Вы можете залогиниться с этим адресом',
  },
} as const;
