import { useContext } from 'react';
import { Button } from 'react-native-paper';

import { sendPasswordReset } from '../../auth/firebase/email-auth';
import { emailMatcher } from '../../constants/email-password-regexp';
import { SignInContext } from '../../utils/context/sign-in';
import { errorHandler } from '../../utils/error-handler';

export default function ResetBtn() {
  const { email, isLoading, setIsLoading, setEmailError } = useContext(SignInContext);

  async function resetHandler() {
    try {
      if (emailMatcher.test(email)) {
        setIsLoading(true);
        await sendPasswordReset(email);
        setIsLoading(false);
      } else {
        setEmailError(true);
      }
    } catch (e) {
      errorHandler(e);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <Button icon="refresh" mode="outlined" style={{ marginTop: 15 }} loading={isLoading} onPress={resetHandler}>
      Reset
    </Button>
  );
}
