import { useState } from 'react';
import { useSelector } from 'react-redux';

export default function usePasswordEmail() {
  const { email: savedEmail, password: savedPassword } = useSelector(({ profile }) => profile?.privateInfo);
  const [email, setEmail] = useState(savedEmail);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [password, setPassword] = useState(savedPassword);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  return {
    email,
    emailError,
    passwordError,
    password,
    isLoading,
    isDisabled,
    setEmail,
    setEmailError,
    setPasswordError,
    setPassword,
    setIsLoading,
    setIsDisabled,
  };
}
