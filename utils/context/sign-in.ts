import { createContext } from 'react';

export const SignInContext = createContext({
  emailError: false,
  passwordError: false,
  isRegister: true,
  isReset: false,
  isLogin: false,
  isLoading: false,
  isDisabled: false,

  setEmailError: (arg: boolean) => {},
  setPasswordError: (arg: boolean) => {},
  setIsRegister: (arg: boolean) => {},
  setIsReset: (arg: boolean) => {},
  setIsLogin: (arg: boolean) => {},
  setIsLoading: (arg: boolean) => {},
  setIsDisabled: (arg: boolean) => {},
});
