import { Platform, View, StyleSheet } from 'react-native';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { ACTIVITY_VISIBILITY } from '@const/activity-visibility';
import { ROUTES } from '@const/enums';
import { resetActivityDraft, resetFinishedActivity } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ActivityUpdateBtn from '@S/users-settings-icons/activity-update-btn/update-btn';

export default function UsersSettingsIcons({ showCreateActivity = false }: { showCreateActivity?: boolean }) {
  const { colors } = useTheme();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { userId } = useGlobalSearchParams();
  const { userId: ownerId } = useAppSelector(({ auth }) => auth);
  const isMineActivity = userId === ownerId && pathname.includes(ROUTES.activity);
  const isSettingsPage = pathname === `/${ROUTES.settings}`;
  const isUsersPage = pathname === `/${ROUTES.users}`;

  const openRoute = (route: `/${ROUTES.users}` | `/${ROUTES.settings}`, alreadyThere: boolean) => {
    if (!alreadyThere) {
      push(route);
    }
  };

  return (
    <View style={styles.layout}>
      {isMineActivity ? (
        <ActivityUpdateBtn />
      ) : (
        <>
          {showCreateActivity ? (
            <IconButton
              testID="createActivityIcon"
              icon="plus"
              iconColor={colors.primary}
              size={Platform.OS === 'ios' ? 25 : 30}
              style={styles.iconButton}
              onPress={() => {
                dispatch(resetActivityDraft());
                dispatch(resetFinishedActivity());
                push({
                  pathname: `/${ROUTES.manualActivity}`,
                  params: {
                    cameraVisible: 'false',
                    manualDate: new Date().toISOString(),
                    manualDistance: '0',
                    manualHours: '0',
                    manualMinutes: '0',
                    manualSeconds: '0',
                    mode: 'manual',
                    title: '',
                    description: '',
                    sport: 'run',
                    emotion: 'normal',
                    visibility: ACTIVITY_VISIBILITY.followers,
                  },
                });
              }}
            />
          ) : null}
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
  },
  iconButton: {
    margin: 0,
  },
});
