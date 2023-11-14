import { Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { LOGIN_BTN, LoginBtnProps, REGISTER_BTN } from './const';
import { supabase } from '../../auth/supabase/supabase-init';
import { saveEmailPassword } from '../../redux/profile/profile';
import { errorHandler } from '../../utils/error-handler';
import { emailPasswordHandler } from '../../utils/validate-email-password';

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
      {isRegister && !isLoading && REGISTER_BTN[language].register}
      {isRegister && isLoading && REGISTER_BTN[language].registering}
      {!isRegister && !isLoading && LOGIN_BTN[language].login}
      {!isRegister && isLoading && LOGIN_BTN[language].logining}
    </Button>
  );
}
