import { useContext } from 'react';
import { Button } from 'react-native-paper';

import { logInWithEmailAndPassword } from '../../auth/firebase/email-auth';
import { SignInContext } from '../../utils/context/sign-in';
import { errorHandler } from '../../utils/error-handler';
import { emailPasswordHandler } from '../../utils/validate-email-password';

export default function LoginBtn() {
  const { email, password, isLoading, setIsLoading, setEmailError, setPasswordError } = useContext(SignInContext);

  async function submitHandler() {
    try {
      if (emailPasswordHandler({ email, password, setEmailError, setPasswordError })) {
        setIsLoading(true);
        await logInWithEmailAndPassword(email, password);
        setIsLoading(false);
      }
    } catch (e) {
      errorHandler(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      mode="outlined"
      icon="account"
      style={{ marginTop: 15 }}
      onPress={submitHandler}
      accessibilityRole="button"
      loading={isLoading}>
      Login
    </Button>
  );
}
