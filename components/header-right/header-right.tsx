import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '../../auth/context/auth-context';
import AvatarShowable from '../avatar/avatar-showable';

export default function HeaderRight() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.layout}>
      {user && (
        <Pressable onPress={() => router.push('/(tabs)/profile')}>
          <AvatarShowable size={35} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    marginRight: 10,
  },
});
