import { useState } from 'react';

export default function usePasswordEmail() {
  const [email, setEmail] = useState('aovoronin.piano@gmail.com');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [password, setPassword] = useState('7FWD&rlm');
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(true);
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState(false);
  const [isRegister, setIsRegister] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  return {
    email,
    emailError,
    passwordError,
    password,
    passwordIsNotVisible,
    nickname,
    nicknameError,
    isRegister,
    isReset,
    isLogin,
    isLoading,
    setEmail,
    setEmailError,
    setPasswordError,
    setPassword,
    setPasswordIsVisible,
    setNickname,
    setNicknameError,
    setIsRegister,
    setIsReset,
    setIsLogin,
    setIsLoading,
  };
}
