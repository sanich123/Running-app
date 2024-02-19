import { supabase } from '@A/supabase/supabase-init';
import { saveEmailPassword } from '@R/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { errorHandler } from '@U/error-handler';
import { SignInPageStates, emailPasswordHandler } from '@U/validate-email-password';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Button } from 'react-native-paper';

import { LoginBtnProps, REGISTER_BTN, LOGIN_BTN, RESET_BTN, LoginBtnIcons } from './const';

export default function LoginRegisterBtn({
  email,
  password,
  isLoading,
  isDisabled,
  pageState,
  setIsDisabled,
  setIsLoading,
  setEmailError,
  setPasswordError,
}: LoginBtnProps) {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { push } = useRouter();
  const isRegistering = pageState === SignInPageStates.register;
  const isLogining = pageState === SignInPageStates.login;
  const isResetting = pageState === SignInPageStates.reset;

  return (
    <Button
      icon={LoginBtnIcons[pageState]}
      mode="outlined"
      accessibilityRole="button"
      loading={isLoading}
      disabled={isDisabled}
      onPress={async () => {
        dispatch(saveEmailPassword({ email, password }));
        setIsLoading(true);
        setIsDisabled(true);
        try {
          if (emailPasswordHandler({ email, password, setEmailError, setPasswordError })) {
            if (pageState === SignInPageStates.register) {
              const { error } = await supabase.auth.signUp({ email, password });
              if (!error) {
                push('/need-to-confirm-email');
              } else {
                showCrossPlatformToast(error.message, ToastDuration.long);
              }
            } else if (pageState === SignInPageStates.login) {
              const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
              if (error) {
                showCrossPlatformToast(error.message, ToastDuration.long);
              }
            } else {
              const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: 'http://runich-with-api.netlify.app/change-password',
              });
              if (!error) {
                WebBrowser.openBrowserAsync('http://runich-with-api.netlify.app/change-password');
              }
            }
          }
        } catch (e) {
          errorHandler(e);
        } finally {
          setIsLoading(false);
          setIsDisabled(false);
        }
      }}>
      {isRegistering && !isLoading && REGISTER_BTN[language].register}
      {isRegistering && isLoading && REGISTER_BTN[language].registering}
      {isLogining && !isLoading && LOGIN_BTN[language].login}
      {isLogining && isLoading && LOGIN_BTN[language].logining}
      {isResetting && !isLoading && RESET_BTN[language].login}
      {isResetting && isLoading && RESET_BTN[language].logining}
    </Button>
  );
}
