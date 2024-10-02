import { createSessionFromTokens, createSessionFromUrl } from '@A/supabase/storage/sign-in';
import GoogleSignBtn from '@C/sign-in/google-sign-in/google-sign-in';
import GoogleSignInWeb from '@C/sign-in/google-sign-in-web/google-sign-in-web';
import PasswordInput from '@C/sign-in/password-input/password-input';
import usePasswordEmail from '@U/hooks/use-password-email';
import { SignInPageStates } from '@U/validate-email-password';
import * as Linking from 'expo-linking';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef } from 'react';
import { View, Platform, TextInput, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';

import EmailInput from './email-input/email-input';
import LoginRegisterBtn from './login-register-btn/login-register-btn';
import LoginRegisterNavigation from './login-register-navigation/login-register-navigation';
import Intro from './intro/intro';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignIn() {
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
  const { colors } = useTheme();
  const passwordRef = useRef<TextInput>(null);
  const { access_token, refresh_token } = useLocalSearchParams();
  const url = Linking.useURL();
  const { height } = useWindowDimensions();

  if (Platform.OS === 'web') {
    WebBrowser.maybeCompleteAuthSession();
  }

  useEffect(() => {
    if (access_token) {
      createSessionFromTokens(`${access_token}`, `${refresh_token}`);
    }
  }, [access_token, refresh_token]);

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url);
    }
  }, [url]);

  return (
    <>
      {!process.env.IS_TESTING ? <Stack.Screen options={{ title: 'sign up', headerShown: false }} /> : null}
      <SafeAreaView style={{ backgroundColor: colors.background }}>
        <Intro />
        <View style={[styles.inputsWrapper, { backgroundColor: colors.background, height: height * 0.5 }]}>
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
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  inputsWrapper: {
    marginLeft: Platform.OS === 'web' ? 'auto' : 10,
    marginRight: Platform.OS === 'web' ? 'auto' : 10,
  },
});
