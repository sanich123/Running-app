import { useContext } from 'react';
import { Button } from 'react-native-paper';

import { supabase } from '../../auth/supabase/supabase-init';
import { nicknameMatcher } from '../../constants/regexp';
import { SignInContext } from '../../utils/context/sign-in';
import { errorHandler } from '../../utils/error-handler';
import { emailPasswordHandler } from '../../utils/validate-email-password';

export default function RegisterBtn() {
  const {
    email,
    password,
    nickname,
    isLoading,
    setNicknameError,
    setEmailError,
    setPasswordError,
    setIsLoading,
    setIsDisabled,
    isDisabled,
  } = useContext(SignInContext);

  return (
    <Button
      rippleColor="#FF000020"
      icon="login"
      mode="outlined"
      loading={isLoading}
      onPress={async () => {
        try {
          if (!nicknameMatcher.test(nickname)) {
            setNicknameError(true);
          } else if (emailPasswordHandler({ email, password, setEmailError, setPasswordError })) {
            setIsLoading(true);
            setIsDisabled(true);
            const {
              error,
              data: { user },
            } = await supabase.auth.signUp({ email, password });
            console.log(user?.id, error);
          }
        } catch (error) {
          errorHandler(error);
          setIsLoading(false);
          setIsDisabled(false);
        } finally {
          setIsLoading(false);
          setIsDisabled(false);
        }
      }}
      disabled={isDisabled}>
      {`Register${isLoading ? 'ing' : ''}`}
    </Button>
  );
}
