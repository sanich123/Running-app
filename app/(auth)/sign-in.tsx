import { Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

import EmailInput from '../../components/email-input/email-input';
import LoginBtn from '../../components/login-btn/login-btn';
import LoginNavigation from '../../components/login-navigation/login-navigation';
import PasswordInput from '../../components/password-input/password-input';
import RegisterBtn from '../../components/register-btn/register-btn';
import RegisterNavigation from '../../components/register-navigation/register-navigation';
import ResetBtn from '../../components/reset-btn/reset-btn';
import ResetNavigation from '../../components/reset-navigation/reset-navigation';
import { signInStyles } from '../../styles/sign-in-page/sign-in-page';
import { SignInContext } from '../../utils/context/sign-in';
import usePasswordEmail from '../../utils/hooks/use-password-email';

export default function SignIn() {
  const { email: savedEmail, password: savedPassword } = useSelector(({ profile }) => profile?.privateInfo);
  const [email, setEmail] = useState(savedEmail);
  const [password, setPassword] = useState(savedPassword);
  const {
    emailError,
    passwordError,
    isRegister,
    isReset,
    isLogin,
    isLoading,
    isDisabled,
    setEmailError,
    setPasswordError,
    setIsRegister,
    setIsReset,
    setIsLogin,
    setIsLoading,
    setIsDisabled,
  } = usePasswordEmail();

  return (
    <>
      <Stack.Screen options={{ title: 'sign up', headerShown: false }} />
      <SignInContext.Provider
        value={{
          emailError,
          passwordError,
          isRegister,
          isReset,
          isLogin,
          isLoading,
          isDisabled,
          setEmailError,
          setPasswordError,
          setIsRegister,
          setIsReset,
          setIsLogin,
          setIsLoading,
          setIsDisabled,
        }}>
        <View style={signInStyles.container}>
          <EmailInput
            email={email}
            setEmail={setEmail}
            emailError={emailError}
            setEmailError={setEmailError}
            isDisabled={false}
          />
          {!isReset && (
            <PasswordInput
              password={password}
              setPassword={setPassword}
              setPasswordError={setPasswordError}
              passwordError={passwordError}
              isDisabled={isDisabled}
            />
          )}
          {isRegister && <RegisterBtn password={password} email={email} />}
          {isLogin && <LoginBtn password={password} email={email} />}
          {isReset && <ResetBtn />}
          {isRegister && <RegisterNavigation />}
          {isLogin && <LoginNavigation />}
          {(isReset || isLogin) && <ResetNavigation />}
        </View>
      </SignInContext.Provider>
    </>
  );
}
