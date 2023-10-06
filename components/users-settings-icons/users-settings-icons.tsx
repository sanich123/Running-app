import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';

import { View } from '../Themed';

export default function UsersSettingsIcons() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <View style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'transparent' }}>
      <MaterialCommunityIcons
        name="account-multiple"
        color={colors.primaryContainer}
        size={30}
        style={{ marginRight: 5 }}
        onPress={() => router.push('/users')}
      />
      <MaterialCommunityIcons
        name="cog-outline"
        color={colors.primaryContainer}
        size={30}
        style={{ marginRight: 5 }}
        onPress={() => router.push('/settings')}
      />
    </View>
  );
}
