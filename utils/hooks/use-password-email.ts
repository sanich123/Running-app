import { useState } from 'react';

export default function usePasswordEmail() {
  const [email, setEmail] = useState('aovoronin.piano@gmail.com');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [password, setPassword] = useState('7FWD&rlm');
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(true);
  return {
    email,
    emailError,
    passwordError,
    password,
    passwordIsNotVisible,
    setEmail,
    setEmailError,
    setPasswordError,
    setPassword,
    setPasswordIsVisible,
  };
}
