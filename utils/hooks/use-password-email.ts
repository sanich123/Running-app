import { useState } from 'react';
import { useSelector } from 'react-redux';

export default function usePasswordEmail() {
  const { email: savedEmail, password: savedPassword } = useSelector(({ profile }) => profile?.privateInfo);
  const [email, setEmail] = useState(savedEmail);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [password, setPassword] = useState(savedPassword);
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(true);
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState(false);
  const [isRegister, setIsRegister] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
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
    isDisabled,
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
    setIsDisabled,
  };
}
