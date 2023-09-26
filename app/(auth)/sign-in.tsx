import EmailInput from '@c/email-input/email-input';
import LoginBtn from '@c/login-btn/login-btn';
import LoginNavigation from '@c/login-navigation/login-navigation';
import NicknameInput from '@c/nickname-input/nickname-input';
import PasswordInput from '@c/password-input/password-input';
import RegisterBtn from '@c/register-btn/register-btn';
import RegisterNavigation from '@c/register-navigation/register-navigation';
import ResetBtn from '@c/reset-btn/reset-btn';
import ResetNavigation from '@c/reset-navigation/reset-navigation';
import { SignInContext } from '@u/context/sign-in';
import usePasswordEmail from '@u/hooks/use-password-email';
import { Stack } from 'expo-router';
import { View } from 'react-native';

import { signInStyles } from '../../styles/sign-in-page/sign-in-page';

export default function SignIn() {
  const {
    email,
    emailError,
    passwordError,
    password,
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
    setNickname,
    setNicknameError,
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
          email,
          emailError,
          passwordError,
          password,
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
          setNickname,
          setNicknameError,
          setIsRegister,
          setIsReset,
          setIsLogin,
          setIsLoading,
          setIsDisabled,
        }}>
        <View style={signInStyles.container}>
          {isRegister && <NicknameInput />}
          <EmailInput />
          {!isReset && <PasswordInput />}
          {isRegister && <RegisterBtn />}
          {isLogin && <LoginBtn />}
          {isReset && <ResetBtn />}
          {isRegister && <RegisterNavigation />}
          {isLogin && <LoginNavigation />}
          {(isReset || isLogin) && <ResetNavigation />}
        </View>
      </SignInContext.Provider>
    </>
  );
}
