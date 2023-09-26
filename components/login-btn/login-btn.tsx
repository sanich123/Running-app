import { supabase } from '@auth/supabase/supabase-init';
import { SignInContext } from '@u/context/sign-in';
import { errorHandler } from '@u/error-handler';
import { emailPasswordHandler } from '@u/validate-email-password';
import { useContext } from 'react';
import { Alert } from 'react-native';
import { Button } from 'react-native-paper';

export default function LoginBtn() {
  const { email, password, isLoading, isDisabled, setIsDisabled, setIsLoading, setEmailError, setPasswordError } =
    useContext(SignInContext);

  return (
    <Button
      mode="outlined"
      icon="account"
      onPress={async () => {
        try {
          if (emailPasswordHandler({ email, password, setEmailError, setPasswordError })) {
            setIsLoading(true);
            setIsDisabled(true);
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) Alert.alert(error.message);
            setIsLoading(false);
            setIsLoading(false);
          }
        } catch (e) {
          errorHandler(e);
          setIsLoading(false);
          setIsLoading(false);
        }
      }}
      accessibilityRole="button"
      loading={isLoading}
      disabled={isDisabled}>
      {`Login${isLoading ? 'ing' : ''}`}
    </Button>
  );
}
