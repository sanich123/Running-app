import { Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import EmailInput from '../../components/email-input/email-input';
import LoginRegisterBtn from '../../components/login-register-btn/login-register-btn';
import LoginRegisterNavigation from '../../components/login-register-navigation/login-register-navigation';
import PasswordInput from '../../components/password-input/password-input';
import { signInStyles } from '../../styles/sign-in-page/sign-in-page';
import usePasswordEmail from '../../utils/hooks/use-password-email';

export default function SignIn() {
  const {
    email,
    password,
    emailError,
    passwordError,
    isLoading,
    isDisabled,
    setEmail,
    setPassword,
    setEmailError,
    setPasswordError,
    setIsLoading,
    setIsDisabled,
  } = usePasswordEmail();
  const [isRegister, setIsRegister] = useState(true);

  return (
    <>
      <Stack.Screen options={{ title: 'sign up', headerShown: false }} />
      <View style={signInStyles.container}>
        <EmailInput
          email={email}
          setEmail={setEmail}
          emailError={emailError}
          setEmailError={setEmailError}
          isDisabled={isDisabled}
        />
        <PasswordInput
          password={password}
          setPassword={setPassword}
          setPasswordError={setPasswordError}
          passwordError={passwordError}
          isDisabled={isDisabled}
        />
        <LoginRegisterBtn
          isRegister={isRegister}
          password={password}
          email={email}
          isDisabled={isDisabled}
          isLoading={isLoading}
          setIsDisabled={setIsDisabled}
          setIsLoading={setIsLoading}
          setEmailError={setEmailError}
          setPasswordError={setPasswordError}
        />
        <LoginRegisterNavigation isRegister={isRegister} isDisabled={isDisabled} setIsRegister={setIsRegister} />
      </View>
    </>
  );
}
