import { ROUTES } from '@const/enums';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';

import { View } from '../Themed';

export default function UsersSettingsIcons() {
  const { colors } = useTheme();
  const { push } = useRouter();
  return (
    <View style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'transparent' }}>
      <MaterialCommunityIcons
        testID="usersIcon"
        name="account-multiple"
        color={colors.primaryContainer}
        size={30}
        style={{ marginRight: 5 }}
        onPress={() => push(`/${ROUTES.users}`)}
      />
      <MaterialCommunityIcons
        testID="settingsIcon"
        name="cog-outline"
        color={colors.primaryContainer}
        size={30}
        style={{ marginRight: 5 }}
        onPress={() => push(`/${ROUTES.settings}`)}
      />
    </View>
  );
}
