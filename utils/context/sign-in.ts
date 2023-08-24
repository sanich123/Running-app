import { createContext } from 'react';

export const SignInContext = createContext({
  email: 'aovoronin.piano@gmail.com',
  emailError: false,
  passwordError: false,
  password: '7FWD&rlm',
  nickname: '',
  nicknameError: false,
  isRegister: true,
  isReset: false,
  isLogin: false,
  isLoading: false,
  setEmail: (arg: string) => {},
  setEmailError: (arg: boolean) => {},
  setPasswordError: (arg: boolean) => {},
  setPassword: (arg: string) => {},
  setNickname: (arg: string) => {},
  setNicknameError: (arg: boolean) => {},
  setIsRegister: (arg: boolean) => {},
  setIsReset: (arg: boolean) => {},
  setIsLogin: (arg: boolean) => {},
  setIsLoading: (arg: boolean) => {},
});