import { Platform, View, StyleSheet } from 'react-native';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { IconButton, TouchableRipple, useTheme } from 'react-native-paper';
import ActivityUpdateBtn from '@C/activity/update-btn/update-btn';
import AvatarShowable from '@C/avatar/showable/showable';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';

export default function UsersSettingsIcons() {
  const { colors, dark } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const { userId } = useGlobalSearchParams();
  const { userId: ownerId } = useAppSelector(({ auth }) => auth);
  const isMineActivity = userId === ownerId && pathname.includes(ROUTES.activity);
  const isHomePage = pathname === '/' || pathname === '/index';
  const isSettingsPage = pathname === `/${ROUTES.settings}`;
  const isUsersPage = pathname === `/${ROUTES.users}`;

  const openRoute = (route: '/(protected)/users' | '/(protected)/settings', alreadyThere: boolean) => {
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
          {Platform.OS === 'web' && (
            <IconButton
              testID="usersIcon"
              icon="home-outline"
              iconColor={colors.primary}
              size={30}
              onPress={() => push('/')}
              style={styles.iconButton}
            />
          )}
          <IconButton
            testID="usersIcon"
            icon="account-search-outline"
            iconColor={colors.primary}
            size={Platform.OS === 'ios' ? 25 : 30}
            onPress={() => openRoute('/(protected)/users', isUsersPage)}
            style={styles.iconButton}
          />
          <IconButton
            testID="settingsIcon"
            icon="cog-outline"
            animated
            iconColor={colors.primary}
            size={Platform.OS === 'ios' ? 25 : 30}
            style={styles.iconButton}
            onPress={() => openRoute('/(protected)/settings', isSettingsPage)}
          />
          {Platform.OS === 'web' && (
            <>
              <IconButton
                icon="chart-bar-stacked"
                animated
                iconColor={colors.primary}
                size={30}
                style={{ marginRight: 10 }}
                onPress={() => push('/(protected)/month-statistic')}
              />
              <TouchableRipple
                rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
                borderless
                onPress={() => push(`/(protected)/${ROUTES.profile}/${ownerId}`)}
                style={{ marginRight: 10 }}>
                <AvatarShowable size={30} id={`${ownerId}`} />
              </TouchableRipple>
            </>
          )}
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
