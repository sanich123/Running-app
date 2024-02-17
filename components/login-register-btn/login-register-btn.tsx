import { supabase } from '@A/supabase/supabase-init';
import { saveEmailPassword } from '@R/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorHandler } from '@U/error-handler';
import { emailPasswordHandler } from '@U/validate-email-password';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { Button } from 'react-native-paper';

import { LoginBtnProps, REGISTER_BTN, LOGIN_BTN } from './const';

export default function LoginRegisterBtn({
  email,
  password,
  isLoading,
  isDisabled,
  isRegister,
  setIsDisabled,
  setIsLoading,
  setEmailError,
  setPasswordError,
}: LoginBtnProps) {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { push } = useRouter();
  return (
    <Button
      icon={isRegister ? 'login' : 'account'}
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
            if (isRegister) {
              const { error } = await supabase.auth.signUp({ email, password });
              if (!error) {
                push('/need-to-confirm-email');
              } else {
                Alert.alert(error.message);
              }
            }
          } else {
            const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
            if (error) Alert.alert(error.message);
          }
        } catch (e) {
          errorHandler(e);
        } finally {
          setIsLoading(false);
          setIsDisabled(false);
        }
      }}>
      {isRegister && !isLoading && REGISTER_BTN[language].register}
      {isRegister && isLoading && REGISTER_BTN[language].registering}
      {!isRegister && !isLoading && LOGIN_BTN[language].login}
      {!isRegister && isLoading && LOGIN_BTN[language].logining}
    </Button>
  );
}
