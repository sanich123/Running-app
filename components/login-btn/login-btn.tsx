import { useContext } from 'react';
import { Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { LOGIN_BTN } from './const';
import { supabase } from '../../auth/supabase/supabase-init';
import { saveEmailPassword } from '../../redux/profile/profile';
import { SignInContext } from '../../utils/context/sign-in';
import { errorHandler } from '../../utils/error-handler';
import { emailPasswordHandler } from '../../utils/validate-email-password';

export default function LoginBtn({ email, password }: { email: string; password: string }) {
  const { isLoading, isDisabled, setIsDisabled, setIsLoading, setEmailError, setPasswordError } =
    useContext(SignInContext);
  const dispatch = useDispatch();
  const { language } = useSelector(({ language }) => language);

  return (
    <Button
      mode="outlined"
      icon="account"
      onPress={async () => {
        dispatch(saveEmailPassword({ email, password }));
        setIsLoading(true);
        setIsDisabled(true);
        try {
          if (emailPasswordHandler({ email, password, setEmailError, setPasswordError })) {
            const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
            if (error) Alert.alert(error.message);
          }
        } catch (e) {
          errorHandler(e);
        } finally {
          setIsLoading(false);
          setIsDisabled(false);
        }
      }}
      accessibilityRole="button"
      loading={isLoading}
      disabled={isDisabled}>
      {isLoading ? LOGIN_BTN[language].logining : LOGIN_BTN[language].login}
    </Button>
  );
}
