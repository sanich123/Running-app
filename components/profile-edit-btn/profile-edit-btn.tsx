import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export default function ProfileEditBtn() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <Pressable onPress={() => router.push('/profile/settings')}>
      <Text variant="titleMedium" style={{ color: colors.primaryContainer, marginRight: 15 }}>
        Edit
      </Text>
    </Pressable>
  );
}
