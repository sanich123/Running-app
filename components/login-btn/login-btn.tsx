import { useContext } from 'react';
import { Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { supabase } from '../../auth/supabase/supabase-init';
import { saveEmailPassword } from '../../redux/user-info-slice/user-info-slice';
import { SignInContext } from '../../utils/context/sign-in';
import { errorHandler } from '../../utils/error-handler';
import { emailPasswordHandler } from '../../utils/validate-email-password';

export default function LoginBtn() {
  const { email, password, isLoading, isDisabled, setIsDisabled, setIsLoading, setEmailError, setPasswordError } =
    useContext(SignInContext);
  const dispatch = useDispatch();

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
            const { error } = await supabase.auth.signInWithPassword({ email, password });
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
      {`Login${isLoading ? 'ing' : ''}`}
    </Button>
  );
}
