import { supabase } from '@A/supabase/supabase-init';
import { saveEmailPassword } from '@R/profile/profile';
import { errorHandler } from '@U/error-handler';
import { emailPasswordHandler } from '@U/validate-email-password';
import { Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

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
  const dispatch = useDispatch();
  const { language } = useSelector(({ language }) => language);

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
              if (error) Alert.alert(error.message);
            }
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
      {isRegister && !isLoading && REGISTER_BTN[language as keyof typeof REGISTER_BTN].register}
      {isRegister && isLoading && REGISTER_BTN[language as keyof typeof REGISTER_BTN].registering}
      {!isRegister && !isLoading && LOGIN_BTN[language as keyof typeof LOGIN_BTN].login}
      {!isRegister && isLoading && LOGIN_BTN[language as keyof typeof LOGIN_BTN].logining}
    </Button>
  );
}
