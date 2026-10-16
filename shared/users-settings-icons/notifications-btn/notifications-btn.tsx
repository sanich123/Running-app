import { useEffect, useRef } from 'react';
import { AppState, Platform, View } from 'react-native';
import { useIsFocused, useRouter } from 'expo-router';
import { Badge, Icon, TouchableRipple, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { notificationsApi, useGetUnreadNotificationCountQuery } from '@R/services/notifications/notifications';
import { useAppDispatch } from '@R/typed-hooks';
import { notificationsBtnStyles as styles } from './styles';

export default function NotificationsBtn() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const { data: unreadCount = 0, refetch } = useGetUnreadNotificationCountQuery(undefined, {
    refetchOnMountOrArgChange: true,
    pollingInterval: isFocused ? 60_000 : 0,
    skipPollingIfUnfocused: true,
  });
  const wasFocused = useRef(isFocused);
  const iconSize = Platform.OS === 'ios' ? 22 : 26;
  const buttonRadius = (iconSize + 16) / 2;

  useEffect(() => {
    if (isFocused && !wasFocused.current) void refetch();
    wasFocused.current = isFocused;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isFocused) void refetch();
    });
    return () => subscription.remove();
  }, [isFocused, refetch]);

  const openNotifications = () => {
    void dispatch(
      notificationsApi.endpoints.getNotifications.initiate(undefined, { subscribe: false, forceRefetch: true }),
    );
    void dispatch(
      notificationsApi.endpoints.getUnreadNotificationCount.initiate(undefined, {
        subscribe: false,
        forceRefetch: true,
      }),
    );
    push(`/${ROUTES.notifications}` as never);
  };

  return (
    <TouchableRipple
      testID="notificationsIcon"
      style={[
        styles.button,
        {
          width: iconSize + 16,
          height: iconSize + 16,
          borderRadius: (iconSize + 16) / 2,
        },
      ]}
      borderless
      hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
      accessibilityRole="button"
      onPress={({ nativeEvent }) => {
        const x = nativeEvent.locationX ?? buttonRadius;
        const y = nativeEvent.locationY ?? buttonRadius;
        const hitRadius = buttonRadius + 10;
        const distanceFromCenter = Math.hypot(x - buttonRadius, y - buttonRadius);

        if (distanceFromCenter <= hitRadius) openNotifications();
      }}>
      <View pointerEvents="none" style={styles.contents}>
        <Icon source="bell-outline" color={colors.primary} size={iconSize} />
        {unreadCount > 0 ? (
          <Badge
            testID="notificationsBadge"
            size={16}
            style={[styles.badge, { backgroundColor: colors.primary, color: colors.onPrimary }]}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        ) : null}
      </View>
    </TouchableRipple>
  );
}
