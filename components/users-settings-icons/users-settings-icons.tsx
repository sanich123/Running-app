import { useAuth } from '@A/context/auth-context';
import ActivityUpdateBtn from '@C/activity/update-btn/update-btn';
import AvatarShowable from '@C/avatar/showable/showable';
import { ROUTES } from '@const/enums';
import { Href, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { IconButton, TouchableRipple, useTheme } from 'react-native-paper';

export default function UsersSettingsIcons() {
  const { colors, dark } = useTheme();
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
          {Platform.OS === 'web' && (
            <IconButton
              testID="usersIcon"
              icon="home-outline"
              iconColor={colors.primary}
              size={30}
              onPress={() => pathname !== '/home' && push('/')}
              style={{ marginRight: -10 }}
            />
          )}

          <IconButton
            testID="usersIcon"
            icon="account-search-outline"
            iconColor={colors.primary}
            size={Platform.OS === 'ios' ? 25 : 30}
            onPress={() =>
              !pathname.includes(ROUTES.users) &&
              push(`/${place}/${ROUTES.users}` as Href<'/home/users' | '/profile/users'>)
            }
            style={{ marginRight: -10 }}
          />
          <IconButton
            testID="settingsIcon"
            icon="cog-outline"
            animated
            iconColor={colors.primary}
            size={Platform.OS === 'ios' ? 25 : 30}
            onPress={() =>
              !pathname.includes(ROUTES.settings) &&
              push(`/${place}/${ROUTES.settings}` as Href<'/home/settings' | '/profile/settings'>)
            }
          />
          {Platform.OS === 'web' && (
            <TouchableRipple
              rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
              borderless
              onPress={() => push(`/${ROUTES.profile}`)}
              style={{ marginRight: 10 }}>
              <AvatarShowable size={30} id={`${user?.id}`} />
            </TouchableRipple>
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
  },
});
