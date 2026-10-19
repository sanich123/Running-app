import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { ROUTES } from '@const/enums';
import { Tags } from '@R/runich-api/const';
import { activityApi } from '@R/services/activity/activity';
import { commentsApi } from '@R/services/comments/comments';
import { likesApi } from '@R/services/likes/likes';
import { notificationsApi } from '@R/services/notifications/notifications';
import { useAppDispatch } from '@R/typed-hooks';
import type { PushNotificationData } from './types';

export function useNotificationRuntime() {
  const dispatch = useAppDispatch();
  const handledResponse = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    const handleResponse = (response: Notifications.NotificationResponse) => {
      const requestId = response.notification.request.identifier;
      if (handledResponse.current === requestId) return;
      handledResponse.current = requestId;
      const data = response.notification.request.content.data as PushNotificationData;
      if (typeof data.notificationId === 'string') {
        void dispatch(notificationsApi.endpoints.markNotificationRead.initiate(data.notificationId));
      }
      if (data.targetType === 'activity' && typeof data.targetId === 'string') {
        dispatch(activityApi.util.invalidateTags([{ type: Tags.activities, id: data.targetId }]));
        dispatch(
          commentsApi.util.invalidateTags([
            { type: Tags.comments, id: data.targetId },
            { type: Tags.commentCounts, id: data.targetId },
          ]),
        );
        dispatch(likesApi.util.invalidateTags([{ type: Tags.likes, id: data.targetId }]));
        router.push(`/${ROUTES.activity}/${data.targetId}` as never);
      } else router.push(`/${ROUTES.notifications}` as never);
      Notifications.clearLastNotificationResponse();
    };
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    const receivedSubscription = Notifications.addNotificationReceivedListener(() => {
      dispatch(notificationsApi.util.invalidateTags([Tags.notifications]));
    });
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) handleResponse(lastResponse);
    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, [dispatch]);
}
