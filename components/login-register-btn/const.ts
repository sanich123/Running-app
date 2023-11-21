import { LANGUAGES } from '../../constants/enums';

export const LOGIN_BTN = {
  [LANGUAGES.english]: {
    login: 'Login',
    logining: 'Logining..',
  },
  [LANGUAGES.russian]: {
    login: 'Логин',
    logining: 'Логинимся..',
  },
};
export const REGISTER_BTN = {
  [LANGUAGES.english]: {
    register: 'Register',
    registering: 'Registering..',
  },
  [LANGUAGES.russian]: {
    register: 'Регистрация',
    registering: 'Регистрирую..',
  },
};
export type LoginBtnProps = {
  email: string;
  password: string;
  isLoading: boolean;
  isDisabled: boolean;
  isRegister: boolean;
  setIsDisabled: (arg: boolean) => void;
  setIsLoading: (arg: boolean) => void;
  setEmailError: (arg: boolean) => void;
  setPasswordError: (arg: boolean) => void;
};
