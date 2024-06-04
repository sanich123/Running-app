import { useAuth } from '@A/context/auth-context';
import ActivityUpdateBtn from '@C/activity/update-btn/update-btn';
import { ROUTES } from '@const/enums';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
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
    <View style={styles.layout}>
      {isMineActivity ? (
        <ActivityUpdateBtn />
      ) : (
        <>
          <IconButton
            testID="usersIcon"
            icon="account-search-outline"
            iconColor={colors.primary}
            size={Platform.OS === 'ios' ? 25 : 30}
            onPress={() => !pathname.includes(ROUTES.users) && push(`/${place}/${ROUTES.users}/`)}
          />
          <IconButton
            testID="settingsIcon"
            icon="cog-outline"
            animated
            iconColor={colors.primary}
            size={Platform.OS === 'ios' ? 25 : 30}
            onPress={() => !pathname.includes(ROUTES.settings) && push(`/${place}/${ROUTES.settings}/`)}
            style={{ marginLeft: -10 }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
