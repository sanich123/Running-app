import { useAuth } from '@auth/context/auth-context';
import { Button } from 'react-native-paper';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  return (
    <Button mode="outlined" icon="logout" onPress={() => signOut()} style={{ marginTop: 15 }}>
      LogOut
    </Button>
  );
}
