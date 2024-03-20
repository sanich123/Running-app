import { createSessionFromUrl } from '@A/supabase/storage/sign-in';
import EmailInput from '@C/email-input/email-input';
import GoogleSignBtn from '@C/google-sign-in/google-sign-in';
import GoogleSignInWeb from '@C/google-sign-in-web/google-sign-in-web';
import LoginRegisterBtn from '@C/login-register-btn/login-register-btn';
import LoginRegisterNavigation from '@C/login-register-navigation/login-register-navigation';
import PasswordInput from '@C/password-input/password-input';
import usePasswordEmail from '@U/hooks/use-password-email';
import { SignInPageStates } from '@U/validate-email-password';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef } from 'react';
import { View, Platform, TextInput } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function SignIn() {
  const { colors } = useTheme();
  const passwordRef = useRef<TextInput>(null);

  if (Platform.OS === 'web') {
    WebBrowser.maybeCompleteAuthSession();
  }
  const {
    email,
    password,
    emailError,
    passwordError,
    isLoading,
    isDisabled,
    pageState,
    setPageState,
    setEmail,
    setPassword,
    setEmailError,
    setPasswordError,
    setIsLoading,
    setIsDisabled,
  } = usePasswordEmail();

  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url);
    }
  }, [url]);

  return (
    <>
      {!process.env.IS_TESTING ? <Stack.Screen options={{ title: 'sign up', headerShown: false }} /> : null}
      <View className="flex-1 justify-center" style={{ backgroundColor: colors.background }}>
        <View
          className="flex-1 justify-center px-4"
          style={{
            backgroundColor: colors.background,
            marginLeft: Platform.OS === 'web' ? 'auto' : 0,
            marginRight: Platform.OS === 'web' ? 'auto' : 0,
          }}>
          {pageState !== SignInPageStates.reset && !process.env.IS_TESTING ? (
            <>
              {Platform.OS !== 'web' ? (
                <GoogleSignBtn setIsDisabled={setIsDisabled} />
              ) : (
                <GoogleSignInWeb setIsDisabled={setIsDisabled} />
              )}
            </>
          ) : null}
          <EmailInput
            passwordRef={passwordRef}
            email={email}
            setEmail={setEmail}
            emailError={emailError}
            setEmailError={setEmailError}
            isDisabled={isDisabled}
          />
          {pageState !== SignInPageStates.reset && (
            <PasswordInput
              passwordRef={passwordRef}
              password={password}
              setPassword={setPassword}
              setPasswordError={setPasswordError}
              passwordError={passwordError}
              isDisabled={isDisabled}
            />
          )}
          <LoginRegisterBtn
            pageState={pageState}
            password={password}
            email={email}
            isDisabled={isDisabled}
            isLoading={isLoading}
            setIsDisabled={setIsDisabled}
            setIsLoading={setIsLoading}
            setEmailError={setEmailError}
            setPasswordError={setPasswordError}
          />
          <LoginRegisterNavigation setPageState={setPageState} pageState={pageState} isDisabled={isDisabled} />
        </View>
      </View>
    </>
  );
}
