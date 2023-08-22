import { Button } from 'react-native-paper';

import { registerWithEmailAndPassword } from '../../auth/firebase/email-auth';
import { emailPasswordHandler, emailPasswordHandlerProps } from '../../utils/validate-email-password';

export default function RegisterBtn({ email, password, setEmailError, setPasswordError }: emailPasswordHandlerProps) {
  return (
    <Button
      icon="login"
      mode="outlined"
      style={{ marginTop: 15 }}
      onPress={async () => {
        if (emailPasswordHandler({ email, password, setEmailError, setPasswordError })) {
          await registerWithEmailAndPassword(email, password);
        }
      }}>
      Register
    </Button>
  );
}
