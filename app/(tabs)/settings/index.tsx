import { Button } from 'react-native-paper';

import { useAuth } from '../../../auth/context/auth-context';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  return (
    <Button mode="outlined" icon="logout" onPress={() => signOut()} style={{ marginTop: 15 }}>
      LogOut
    </Button>
  );
}
