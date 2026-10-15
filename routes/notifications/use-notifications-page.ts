import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import {
  useGetNotificationsInfiniteQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@R/services/notifications/notifications';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { NOTIFICATION_COPY } from './constants';
import { getNotificationLocale } from './helpers';
import type { NotificationItem } from '@R/services/notifications/types';

export function useNotificationsPage() {
  const language = useAppSelector(({ settings }) => settings.language);
  const locale = getNotificationLocale(language);
  const copy = NOTIFICATION_COPY[locale];
  const { push } = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    useGetNotificationsInfiniteQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];

  const openNotification = async (item: NotificationItem) => {
    setBusyId(item.id);
    try {
      if (!item.readAt) await markRead(item.id).unwrap();
    } catch (error) {
      errorToast(copy.markReadError, error);
    } finally {
      setBusyId(null);
      if (item.targetType === 'activity' || item.targetType === 'comment') {
        push(`/${ROUTES.activity}/${item.targetId}` as never);
      }
    }
  };

  const markNotificationRead = async (item: NotificationItem) => {
    if (item.readAt) return;
    setBusyId(item.id);
    try {
      await markRead(item.id).unwrap();
    } catch (error) {
      errorToast(copy.markReadError, error);
    } finally {
      setBusyId(null);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await markAllRead().unwrap();
    } catch (error) {
      errorToast(copy.markAllReadError, error);
    }
  };

  const openNotificationSettings = () => push(`/${ROUTES.settings}/${ROUTES.notificationSettings}` as never);

  return {
    busyId,
    copy,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    isMarkingAll,
    locale,
    markAllNotificationsRead,
    markNotificationRead,
    notifications,
    openNotification,
    openNotificationSettings,
    refetch,
    unreadCount,
  };
}
