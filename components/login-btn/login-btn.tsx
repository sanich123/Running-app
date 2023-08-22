import { ToastAndroid } from 'react-native';
import { Button } from 'react-native-paper';

import { logInWithEmailAndPassword } from '../../auth/firebase/email-auth';
import { emailPasswordHandler, emailPasswordHandlerProps } from '../../utils/validate-email-password';

export default function LoginBtn({ email, password, setEmailError, setPasswordError }: emailPasswordHandlerProps) {
  async function submitHandler() {
    if (emailPasswordHandler({ email, password, setEmailError, setPasswordError }))
      try {
        await logInWithEmailAndPassword(email, password);
      } catch (e) {
        if (e instanceof Error) {
          ToastAndroid.show(e.message, ToastAndroid.SHORT);
        }
      }
  }
  return (
    <Button mode="outlined" style={{ marginTop: 15 }} onPress={submitHandler} accessibilityRole="button">
      Login
    </Button>
  );
}
