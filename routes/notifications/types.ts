export type NotificationLocale = 'russian' | 'english';

export interface NotificationDisplayCopy {
  title: string;
  body: string;
}

export interface PushNotificationData {
  notificationId?: unknown;
  targetType?: unknown;
  targetId?: unknown;
}
