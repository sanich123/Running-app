import { LANGUAGES } from '@const/enums';

export const RESET_PASSWORD = {
  [LANGUAGES.english]: {
    redirectToResettingPage: 'Log in and redirect to the password change page...',
  },
  [LANGUAGES.russian]: {
    redirectToResettingPage: 'Авторизовываемся и перенаправляем на страницу смены пароля...',
  },
} as const;
