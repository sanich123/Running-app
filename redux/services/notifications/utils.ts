import { NOTIFICATION_API_ROUTE, NOTIFICATION_PAGE_SIZE } from './constants';
import type { NotificationPage, NotificationUnreadCountResponse } from './types';

export function getNotificationPageUrl(cursor?: string) {
  const cursorQuery = cursor ? `&cursor=${encodeURIComponent(cursor)}` : '';
  return `/${NOTIFICATION_API_ROUTE}?take=${NOTIFICATION_PAGE_SIZE}${cursorQuery}`;
}

export function getNextNotificationCursor(lastPage: NotificationPage) {
  return lastPage.nextCursor ?? undefined;
}

export function getUnreadNotificationCount(response: NotificationUnreadCountResponse) {
  return typeof response === 'number' ? response : response.count;
}
