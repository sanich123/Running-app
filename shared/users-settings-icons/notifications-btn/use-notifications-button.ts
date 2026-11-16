import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useIsFocused, useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import { notificationsApi, useGetUnreadNotificationCountQuery } from '@R/services/notifications/notifications';
import { useAppDispatch } from '@R/typed-hooks';

export default function useNotificationsButton(enabled = true) {
  const { push } = useRouter();
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const { data: unreadCount = 0, refetch } = useGetUnreadNotificationCountQuery(undefined, {
    refetchOnMountOrArgChange: true,
    pollingInterval: enabled && isFocused ? 60_000 : 0,
    skip: !enabled,
    skipPollingIfUnfocused: true,
  });
  const wasFocused = useRef(isFocused);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (isFocused && !wasFocused.current) void refetch();
    wasFocused.current = isFocused;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isFocused) void refetch();
    });
    return () => subscription.remove();
  }, [enabled, isFocused, refetch]);

  const openNotifications = () => {
    if (!enabled) return;
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

  return { unreadCount, openNotifications };
}
