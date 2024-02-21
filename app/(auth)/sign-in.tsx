import { createSessionFromUrl } from '@A/supabase/storage/sign-in';
import EmailInput from '@C/email-input/email-input';
import LoginRegisterBtn from '@C/login-register-btn/login-register-btn';
import LoginRegisterNavigation from '@C/login-register-navigation/login-register-navigation';
import PasswordInput from '@C/password-input/password-input';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import usePasswordEmail from '@U/hooks/use-password-email';
import { SignInPageStates } from '@U/validate-email-password';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
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
    setEmail,
    setPassword,
    setEmailError,
    setPasswordError,
    setIsLoading,
    setIsDisabled,
  } = usePasswordEmail();

  const [pageState, setPageState] = useState(SignInPageStates.register);
  const url = Linking.useURL();
  const configureGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId: '617323850499-oaorec6kohhna9p0dqlek590imnab6jq.apps.googleusercontent.com',
      iosClientId: '617323850499-i286kru7q6bgi2dfl38c6keljvhaelad.apps.googleusercontent.com',
    });
  };

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url);
    }
  }, [url]);

  return (
    <>
      <Stack.Screen options={{ title: 'sign up', headerShown: false }} />
      <View style={signInStyles.container}>
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Dark}
          onPress={async () => {
            try {
              await GoogleSignin.hasPlayServices();
              const userInfo = await GoogleSignin.signIn();
              console.log(userInfo);
            } catch (error) {
              console.log(error);
              showCrossPlatformToast(JSON.stringify(error), ToastDuration.long);
            }
          }}
        />
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
