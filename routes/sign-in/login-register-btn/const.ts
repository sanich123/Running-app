import { LANGUAGES } from '@const/enums';
import { SignInPageStates } from '@U/validate-email-password';

export const LOGIN_BTN = {
  [LANGUAGES.english]: {
    login: 'Login',
    logining: 'Logining..',
  },
  [LANGUAGES.russian]: {
    login: 'Логин',
    logining: 'Логинимся..',
  },
} as const;

export const REGISTER_BTN = {
  [LANGUAGES.english]: {
    register: 'Register',
    registering: 'Registering..',
  },
  [LANGUAGES.russian]: {
    register: 'Регистрация',
    registering: 'Регистрирую..',
  },
} as const;

export const RESET_BTN = {
  [LANGUAGES.english]: {
    login: 'Reset',
    logining: 'Resetting..',
  },
  [LANGUAGES.russian]: {
    login: 'Сброс',
    logining: 'Сбрасываем..',
  },
} as const;

export const EMAIL_LINK_BTN = {
  [LANGUAGES.english]: {
    send: 'Send login link',
    sending: 'Sending..',
  },
  [LANGUAGES.russian]: {
    send: 'Получить ссылку',
    sending: 'Отправляем..',
  },
} as const;

export const LoginBtnIcons = {
  [SignInPageStates.login]: 'login',
  [SignInPageStates.register]: 'account',
  [SignInPageStates.reset]: 'key-change',
  [SignInPageStates.emailLink]: 'email-outline',
};
