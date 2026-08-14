import { LANGUAGES } from '@const/enums';

export const REGISTER_NAVIGATION = {
  [LANGUAGES.english]: {
    text: "Don't have an account?",
    btn: 'Register',
  },
  [LANGUAGES.russian]: {
    text: 'Нет аккаунта?',
    btn: 'Зарегаться',
  },
} as const;

export const LOGIN_NAVIGATION = {
  [LANGUAGES.english]: {
    text: 'Already have an account?',
    btn: 'Sign in',
  },
  [LANGUAGES.russian]: {
    text: 'Уже есть аккаунт?',
    btn: 'Войти',
  },
} as const;

export const RESET_NAVIGATION = {
  [LANGUAGES.english]: {
    text: 'Want to change your password?',
    btn: 'Change password',
  },
  [LANGUAGES.russian]: {
    text: 'Хотите изменить пароль?',
    btn: 'Изменить пароль',
  },
} as const;

export const EMAIL_LINK_NAVIGATION = {
  [LANGUAGES.english]: {
    text: 'Want to sign in by link?',
    btn: 'Use email link',
    backText: 'Sign in with a password?',
    backBtn: 'Back to login',
  },
  [LANGUAGES.russian]: {
    text: 'Войти по ссылке?',
    btn: 'Войти по ссылке',
    backText: 'Войти по паролю?',
    backBtn: 'К логину',
  },
} as const;
