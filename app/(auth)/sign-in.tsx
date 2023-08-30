import { Stack } from 'expo-router';
import { View } from 'react-native';

import EmailInput from '../../components/email-input/email-input';
import LoginBtn from '../../components/login-btn/login-btn';
import LoginNavigation from '../../components/login-navigation/login-navigation';
import NicknameInput from '../../components/nickname-input/nickname-input';
import PasswordInput from '../../components/password-input/password-input';
import RegisterBtn from '../../components/register-btn/register-btn';
import RegisterNavigation from '../../components/register-navigation/register-navigation';
import ResetBtn from '../../components/reset-btn/reset-btn';
import RersetNavigation from '../../components/reset-navigation/reset-navigation';
import { signInStyles } from '../../styles/sign-in-page/sign-in-page';
import { SignInContext } from '../../utils/context/sign-in';
import usePasswordEmail from '../../utils/hooks/use-password-email';

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
          {(isReset || isLogin) && <RersetNavigation />}
        </View>
      </SignInContext.Provider>
    </>
  );
}
