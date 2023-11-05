import { createContext } from 'react';

export const SignInContext = createContext({
  email: '',
  emailError: false,
  passwordError: false,
  password: '',
  isRegister: true,
  isReset: false,
  isLogin: false,
  isLoading: false,
  isDisabled: false,
  setEmail: (arg: string) => {},
  setEmailError: (arg: boolean) => {},
  setPasswordError: (arg: boolean) => {},
  setPassword: (arg: string) => {},
  setIsRegister: (arg: boolean) => {},
  setIsReset: (arg: boolean) => {},
  setIsLogin: (arg: boolean) => {},
  setIsLoading: (arg: boolean) => {},
  setIsDisabled: (arg: boolean) => {},
});
