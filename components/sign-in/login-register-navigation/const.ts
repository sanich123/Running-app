import { SignInPageStates } from '@U/validate-email-password';
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
    btn: 'Login',
  },
  [LANGUAGES.russian]: {
    text: 'Уже есть аккаунт?',
    btn: 'Залогиниться',
  },
} as const;

export const RESET_NAVIGATION = {
  [LANGUAGES.english]: {
    text: 'Forgot your password?',
    btn: 'Reset',
  },
  [LANGUAGES.russian]: {
    text: 'Забыли ваш пароль?',
    btn: 'Cбросить',
  },
} as const;

export type RegisterNavigationProps = {
  setPageState: (arg: SignInPageStates) => void;
  isDisabled: boolean;
  pageState: SignInPageStates;
};
