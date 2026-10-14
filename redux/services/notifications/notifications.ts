import { Methods, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import { NOTIFICATION_API_ROUTE } from './constants';
import { getNextNotificationCursor, getNotificationPageUrl, getUnreadNotificationCount } from './utils';
import type { NotificationPage, PushTokenStatus, RegisterPushTokenBody } from './types';

export const notificationsApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ query, mutation, infiniteQuery }) => ({
    getNotifications: infiniteQuery<NotificationPage, void, string | undefined>({
      infiniteQueryOptions: {
        initialPageParam: undefined,
        getNextPageParam: getNextNotificationCursor,
      },
      query: ({ pageParam }) => getNotificationPageUrl(pageParam),
      providesTags: [Tags.notifications],
    }),
    getUnreadNotificationCount: query<number, void>({
      query: () => `/${NOTIFICATION_API_ROUTE}/unread-count`,
      transformResponse: getUnreadNotificationCount,
      providesTags: [Tags.notifications],
    }),
    markNotificationRead: mutation<{ updated: number }, string>({
      query: (id) => ({ url: `/${NOTIFICATION_API_ROUTE}/${id}/read`, method: Methods.patch }),
      invalidatesTags: [Tags.notifications],
    }),
    markAllNotificationsRead: mutation<{ updated: number }, void>({
      query: () => ({ url: `/${NOTIFICATION_API_ROUTE}/read-all`, method: Methods.patch }),
      invalidatesTags: [Tags.notifications],
    }),
    getPushTokenStatus: query<PushTokenStatus, void>({
      query: () => `/${NOTIFICATION_API_ROUTE}/push-token`,
      providesTags: [Tags.notifications],
    }),
    registerPushToken: mutation<PushTokenStatus, RegisterPushTokenBody>({
      query: (body) => ({ url: `/${NOTIFICATION_API_ROUTE}/push-token`, method: Methods.post, body }),
      invalidatesTags: [Tags.notifications],
    }),
    unregisterPushToken: mutation<PushTokenStatus, void>({
      query: () => ({ url: `/${NOTIFICATION_API_ROUTE}/push-token`, method: Methods.delete }),
      invalidatesTags: [Tags.notifications],
    }),
  }),
});

export const {
  useGetNotificationsInfiniteQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetPushTokenStatusQuery,
  useRegisterPushTokenMutation,
  useUnregisterPushTokenMutation,
} = notificationsApi;
