import { useContext } from 'react';
import { Button } from 'react-native-paper';

import { registerWithEmailAndPassword } from '../../auth/firebase/email-auth';
import { SignInContext } from '../../utils/context/sign-in';
import { errorHandler } from '../../utils/error-handler';
import { emailPasswordHandler } from '../../utils/validate-email-password';

export default function RegisterBtn() {
  const { email, password, nickname, isLoading, setEmailError, setPasswordError, setIsLoading } =
    useContext(SignInContext);

  async function registerHandler() {
    try {
      setIsLoading(true);
      if (emailPasswordHandler({ email, password, setEmailError, setPasswordError })) {
        await registerWithEmailAndPassword(nickname, email, password);
        setIsLoading(false);
      }
    } catch (error) {
      errorHandler(error);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <Button
      rippleColor="#FF000020"
      icon="login"
      mode="outlined"
      style={{ marginTop: 15 }}
      loading={isLoading}
      onPress={registerHandler}>
      Register
    </Button>
  );
}
