import { Button } from 'react-native-paper';

import { registerWithEmailAndPassword } from '../../auth/firebase/email-auth';
import { emailPasswordHandler, emailPasswordHandlerProps } from '../../utils/validate-email-password';

type RegisterBtnProps = {
  nickname: string;
};

export default function RegisterBtn({
  email,
  password,
  setEmailError,
  setPasswordError,
  nickname,
}: emailPasswordHandlerProps & RegisterBtnProps) {
  return (
    <Button
      icon="login"
      mode="outlined"
      style={{ marginTop: 15 }}
      onPress={async () => {
        if (emailPasswordHandler({ email, password, setEmailError, setPasswordError })) {
          await registerWithEmailAndPassword(nickname, email, password);
        }
      }}>
      Register
    </Button>
  );
}
