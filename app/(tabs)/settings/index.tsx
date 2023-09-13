import { Button } from 'react-native-paper';

import { logOut } from '../../../auth/firebase/email-auth';

export default function SettingsScreen() {
  return (
    <Button mode="outlined" icon="logout" onPress={() => logOut()} style={{ marginTop: 15 }}>
      LogOut
    </Button>
  );
}
