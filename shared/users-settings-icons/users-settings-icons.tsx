import { useEffect, useRef } from 'react';
import { AppState, Platform, View } from 'react-native';
import { useGlobalSearchParams, useIsFocused, usePathname, useRouter } from 'expo-router';
import { Badge, IconButton, useTheme } from 'react-native-paper';
import { ACTIVITY_VISIBILITY } from '@const/activity-visibility';
import { ROUTES } from '@const/enums';
import { useGetUnreadNotificationCountQuery } from '@R/services/notifications/notifications';
import { resetActivityDraft, resetFinishedActivity } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ActivityUpdateBtn from '@S/users-settings-icons/activity-update-btn/update-btn';
import { usersSettingsIconsStyles as styles } from './styles';
import type { UsersSettingsIconsProps } from './types';

export default function UsersSettingsIcons({ showCreateActivity = false }: UsersSettingsIconsProps) {
  const { colors } = useTheme();
  const { push } = useRouter();
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { userId } = useGlobalSearchParams();
  const { userId: ownerId } = useAppSelector(({ auth }) => auth);
  const { data: unreadCount = 0, refetch } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !showCreateActivity,
    refetchOnMountOrArgChange: true,
    pollingInterval: showCreateActivity && isFocused ? 60_000 : 0,
    skipPollingIfUnfocused: true,
  });
  const wasFocused = useRef(isFocused);

  useEffect(() => {
    if (showCreateActivity && isFocused && !wasFocused.current) void refetch();
    wasFocused.current = isFocused;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && showCreateActivity && isFocused) void refetch();
    });
    return () => subscription.remove();
  }, [isFocused, refetch, showCreateActivity]);
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
              size={Platform.OS === 'ios' ? 22 : 26}
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
            size={Platform.OS === 'ios' ? 22 : 26}
            onPress={() => openRoute(`/${ROUTES.users}`, isUsersPage)}
            style={styles.iconButton}
          />
          <IconButton
            testID="settingsIcon"
            icon="cog-outline"
            animated
            iconColor={colors.primary}
            size={Platform.OS === 'ios' ? 22 : 26}
            style={styles.iconButton}
            onPress={() => openRoute(`/${ROUTES.settings}`, isSettingsPage)}
          />
          {showCreateActivity ? (
            <View style={styles.notificationButton}>
              <IconButton
                testID="notificationsIcon"
                icon="bell-outline"
                iconColor={colors.primary}
                size={Platform.OS === 'ios' ? 22 : 26}
                onPress={() => push(`/${ROUTES.notifications}` as never)}
                style={styles.iconButton}
              />
              {unreadCount > 0 ? (
                <Badge
                  pointerEvents="none"
                  testID="notificationsBadge"
                  size={16}
                  style={[styles.badge, { backgroundColor: colors.primary, color: colors.onPrimary }]}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              ) : null}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}
