import { useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';

import { View } from '../Themed';

export default function UsersSettingsIcons() {
  const { colors } = useTheme();
  const { push } = useRouter();
  return (
    <View style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'transparent' }}>
      <IconButton
        testID="usersIcon"
        icon="account-multiple"
        iconColor={colors.primaryContainer}
        size={30}
        onPress={() => push(`/users/`)}
        style={{ marginRight: -15 }}
      />
      <IconButton
        testID="settingsIcon"
        icon="cog-outline"
        iconColor={colors.primaryContainer}
        size={30}
        onPress={() => push(`/settings/`)}
        style={{ marginRight: -15 }}
      />
    </View>
  );
}
