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
import { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

export default function SignIn() {
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
      <Stack.Screen options={{ title: 'sign up', headerShown: false }} />
      <View style={signInStyles.container}>
        {Platform.OS !== 'web' ? <GoogleSignBtn /> : <GoogleSignInWeb />}
        <EmailInput
          email={email}
          setEmail={setEmail}
          emailError={emailError}
          setEmailError={setEmailError}
          isDisabled={isDisabled}
        />
        {pageState !== SignInPageStates.reset ? (
          <PasswordInput
            password={password}
            setPassword={setPassword}
            setPasswordError={setPasswordError}
            passwordError={passwordError}
            isDisabled={isDisabled}
          />
        ) : null}
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
    </>
  );
}

const signInStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  btnWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 10,
    marginTop: 10,
  },
  navigateBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#518be8',
    borderRadius: 8,
    padding: 8,
  },
});
