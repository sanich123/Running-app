import { useContext } from 'react';
import { Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { REGISTER_BTN } from './const';
import { supabase } from '../../auth/supabase/supabase-init';
import { saveEmailPassword } from '../../redux/profile/profile';
import { SignInContext } from '../../utils/context/sign-in';
import { errorHandler } from '../../utils/error-handler';
import { emailPasswordHandler } from '../../utils/validate-email-password';

export default function RegisterBtn({ email, password }: { email: string; password: string }) {
  const { isLoading, setEmailError, setPasswordError, setIsLoading, setIsDisabled, isDisabled } =
    useContext(SignInContext);
  const dispatch = useDispatch();
  const { language } = useSelector(({ language }) => language);

  return (
    <Button
      rippleColor="#FF000020"
      icon="login"
      mode="outlined"
      loading={isLoading}
      onPress={async () => {
        setIsLoading(true);
        setIsDisabled(true);
        dispatch(saveEmailPassword({ email, password }));
        try {
          if (emailPasswordHandler({ email, password, setEmailError, setPasswordError })) {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) Alert.alert(error.message);
          }
        } catch (error) {
          errorHandler(error);
        } finally {
          setIsLoading(false);
          setIsDisabled(false);
        }
      }}
      disabled={isDisabled}>
      {isLoading ? REGISTER_BTN[language].registering : REGISTER_BTN[language].register}
    </Button>
  );
}
