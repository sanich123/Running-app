import { useAppSelector } from '@R/typed-hooks';
import { SignInPageStates } from '@U/validate-email-password';
import { useState } from 'react';

export default function usePasswordEmail() {
  const { email: savedEmail, password: savedPassword } = useAppSelector(({ profile }) => profile?.privateInfo);
  const [email, setEmail] = useState(savedEmail);
  const [password, setPassword] = useState(savedPassword);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [pageState, setPageState] = useState(SignInPageStates.register);

  return {
    email,
    emailError,
    passwordError,
    password,
    isLoading,
    isDisabled,
    pageState,
    setPageState,
    setEmail,
    setEmailError,
    setPasswordError,
    setPassword,
    setIsLoading,
    setIsDisabled,
  };
}
