import { Button } from 'react-native-paper';

import { sendPasswordReset } from '../../auth/firebase/email-auth';
import { emailMatcher } from '../../constants/email-password-regexp';

export default function ResetBtn({ email, setEmailError }: { email: string; setEmailError: (arg: boolean) => void }) {
  return (
    <Button
      icon="refresh"
      mode="outlined"
      style={{ marginTop: 15 }}
      onPress={async () => {
        if (!emailMatcher.test(email)) {
          setEmailError(true);
        } else {
          await sendPasswordReset(email);
        }
      }}>
      Reset
    </Button>
  );
}
