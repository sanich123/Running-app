import { SignInPageStates } from '@U/validate-email-password';
import { LANGUAGES } from '@const/enums';

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

export type LoginBtnProps = {
  email: string;
  password: string;
  isLoading: boolean;
  isDisabled: boolean;
  pageState: SignInPageStates;
  setIsDisabled: (arg: boolean) => void;
  setIsLoading: (arg: boolean) => void;
  setEmailError: (arg: boolean) => void;
  setPasswordError: (arg: boolean) => void;
};

export const LoginBtnIcons = {
  [SignInPageStates.login]: 'login',
  [SignInPageStates.register]: 'account',
  // [SignInPageStates.reset]: 'key-change',
};
