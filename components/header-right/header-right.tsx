import { FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';

import { useAuth } from '../../auth/context/auth-context';
import { logOut } from '../../auth/firebase/email-auth';
import Colors from '../../constants/Colors';

export default function HeaderRight() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();

  return (
    <>
      {user && <Link href="/profile">{user?.email}</Link>}
      <Pressable>
        {({ pressed }) => (
          <FontAwesome
            name="sign-out"
            size={25}
            color={Colors[colorScheme ?? 'light'].text}
            style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            onPress={() => logOut()}
          />
        )}
      </Pressable>
    </>
  );
}
