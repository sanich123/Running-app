import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';

import { View } from '../Themed';

export default function UsersSettingsIcons() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;

  return (
    <View style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'transparent' }}>
      <IconButton
        testID="usersIcon"
        icon="account-multiple"
        iconColor={colors.primaryContainer}
        size={30}
        onPress={() => push(`/${place}/users/`)}
        style={{ marginRight: -15 }}
      />
      <IconButton
        testID="settingsIcon"
        icon="cog-outline"
        iconColor={colors.primaryContainer}
        size={30}
        onPress={() => push(`/${place}/settings/`)}
        style={{ marginRight: -15 }}
      />
    </View>
  );
}
