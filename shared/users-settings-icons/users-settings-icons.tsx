import { Platform, View, StyleSheet } from 'react-native';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import ActivityUpdateBtn from '@S/users-settings-icons/activity-update-btn/update-btn';

export default function UsersSettingsIcons() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const { userId } = useGlobalSearchParams();
  const { userId: ownerId } = useAppSelector(({ auth }) => auth);
  const isMineActivity = userId === ownerId && pathname.includes(ROUTES.activity);
  const isHomePage = pathname === ROUTES.root || pathname === `/${ROUTES.index}`;
  const isSettingsPage = pathname === `/${ROUTES.settings}`;
  const isUsersPage = pathname === `/${ROUTES.users}`;

  const openRoute = (route: `/${ROUTES.users}` | `/${ROUTES.settings}`, alreadyThere: boolean) => {
    if (!alreadyThere) {
      push(route);
    }
  };

  return (
    <View style={[styles.layout, isHomePage && styles.homeLayout]}>
      {isMineActivity ? (
        <ActivityUpdateBtn />
      ) : (
        <>
          <IconButton
            testID="usersIcon"
            icon="account-search-outline"
            iconColor={colors.primary}
            size={Platform.OS === 'ios' ? 25 : 30}
            onPress={() => openRoute(`/${ROUTES.users}`, isUsersPage)}
            style={styles.iconButton}
          />
          <IconButton
            testID="settingsIcon"
            icon="cog-outline"
            animated
            iconColor={colors.primary}
            size={Platform.OS === 'ios' ? 25 : 30}
            style={styles.iconButton}
            onPress={() => openRoute(`/${ROUTES.settings}`, isSettingsPage)}
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
    paddingRight: 8,
  },
  homeLayout: {
    paddingRight: 16,
  },
  iconButton: {
    margin: 0,
  },
});
