import { useAuth } from '@A/context/auth-context';
import ActivityUpdateBtn from '@C/activity/update-btn/update-btn';
import { ROUTES } from '@const/enums';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Platform, View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

export default function UsersSettingsIcons() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  const { userId } = useLocalSearchParams();
  const { user } = useAuth();
  const isMineActivity = userId === user?.id && pathname.includes(ROUTES.activity);

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
      }}>
      {isMineActivity ? (
        <ActivityUpdateBtn />
      ) : (
        <>
          <IconButton
            testID="usersIcon"
            icon="account-multiple"
            iconColor={colors.primary}
            size={Platform.OS === 'ios' ? 25 : 30}
            onPress={() => push(`/${place}/users/`)}
          />
          <IconButton
            testID="settingsIcon"
            icon="cog-outline"
            iconColor={colors.primary}
            size={Platform.OS === 'ios' ? 25 : 30}
            onPress={() => push(`/${place}/settings/`)}
            style={{ marginLeft: -10 }}
          />
        </>
      )}
    </View>
  );
}
