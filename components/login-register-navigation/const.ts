import { LANGUAGES } from '../../constants/enums';

export const REGISTER_NAVIGATION = {
  [LANGUAGES.english]: {
    text: 'Already have an account?',
    btn: 'Login',
  },
  [LANGUAGES.russian]: {
    text: 'Уже есть аккаунт?',
    btn: 'Залогиниться',
  },
};

export const LOGIN_NAVIGATION = {
  [LANGUAGES.english]: {
    text: "Don't have an account?",
    btn: 'Register',
  },
  [LANGUAGES.russian]: {
    text: 'Нет аккаунта?',
    btn: 'Зарегаться',
  },
};

export type RegisterNavigationProps = {
  setIsRegister: (arg: boolean) => void;
  isDisabled: boolean;
  isRegister: boolean;
};
