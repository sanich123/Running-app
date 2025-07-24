import ActivityUpdateBtn from '@C/activity/update-btn/update-btn';
import AvatarShowable from '@C/avatar/showable/showable';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { IconButton, TouchableRipple, useTheme } from 'react-native-paper';

export default function UsersSettingsIcons() {
  const { colors, dark } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const { userId } = useGlobalSearchParams();
  const { userId: ownerId } = useAppSelector(({ auth }) => auth);
  const isMineActivity = userId === ownerId && pathname.includes(ROUTES.activity);

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
              onPress={() => push('/')}
              style={{ marginRight: -10 }}
            />
          )}
          <IconButton
            testID="usersIcon"
            icon="account-search-outline"
            iconColor={colors.primary}
            size={Platform.OS === 'ios' ? 25 : 30}
            onPress={() => push('/(protected)/users')}
            style={{ marginRight: -10 }}
          />
          <IconButton
            testID="settingsIcon"
            icon="cog-outline"
            animated
            iconColor={colors.primary}
            size={Platform.OS === 'ios' ? 25 : 30}
            style={{ marginRight: -10 }}
            onPress={() => push('/(protected)/settings')}
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
                onPress={() => push(`/(protected)/${ROUTES.profile}/${userId}`)}
                style={{ marginRight: 10 }}>
                <AvatarShowable size={30} id={`${userId}`} />
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
  },
});
