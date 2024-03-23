import { useAuth } from '@A/context/auth-context';
import ActivityUpdateBtn from '@C/activity-update-btn/activitiy-update-btn';
import { ROUTES } from '@const/enums';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';

import { View } from '../Themed';

export default function UsersSettingsIcons() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  const { userId } = useLocalSearchParams();
  const { user } = useAuth();
  const isMineActivity = userId === user?.id && pathname.includes(ROUTES.activity);

  return (
    <View style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'transparent' }}>
      {isMineActivity ? (
        <ActivityUpdateBtn />
      ) : (
        <>
          <IconButton
            testID="usersIcon"
            icon="account-multiple"
            iconColor={colors.primary}
            size={30}
            onPress={() => push(`/${place}/users/`)}
            style={{ marginRight: -15 }}
          />
          <IconButton
            testID="settingsIcon"
            icon="cog-outline"
            iconColor={colors.primary}
            size={30}
            onPress={() => push(`/${place}/settings/`)}
            style={{ marginRight: -15 }}
          />
        </>
      )}
    </View>
  );
}
