import { supabase } from '@A/supabase/supabase-init';
import { saveEmailPassword } from '@R/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { errorHandler } from '@U/error-handler';
import { SignInPageStates, emailPasswordHandler } from '@U/validate-email-password';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { Button } from 'react-native-paper';
//@ts-ignore
import { useToast } from 'react-native-toast-notifications';

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
  const toast = useToast();
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
            if (isRegistering) {
              const { error } = await supabase.auth.signUp({ email, password });
              if (!error) {
                push('/need-to-confirm-email');
              } else {
                if (Platform.OS === 'web') {
                  toast.show(error.message);
                } else {
                  showCrossPlatformToast(error.message, ToastDuration.long);
                }
              }
            } else if (isLogining) {
              const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
              if (error) {
                if (Platform.OS === 'web') {
                  toast.show(error.message);
                } else {
                  showCrossPlatformToast(error.message, ToastDuration.long);
                }
              }
            } else {
              const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: 'https://runich-with-api.netlify.app/reset-password',
              });
              if (error) {
                if (Platform.OS === 'web') {
                  toast.show(error.message);
                } else {
                  showCrossPlatformToast(error.message, ToastDuration.long);
                }
              } else {
                if (Platform.OS === 'web') {
                  toast.show('Пройдите по ссылке в электронной почте');
                } else {
                  showCrossPlatformToast('Пройдите по ссылке в электронной почте', ToastDuration.long);
                }
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
