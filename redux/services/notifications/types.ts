export interface NotificationItem {
  id: string;
  type: 'activity-like' | 'comment' | 'comment-like' | string;
  targetType: string;
  targetId: string;
  relatedId: string | null;
  actorName: string | null;
  actorSurname: string | null;
  actorProfilePhoto: string | null;
  content: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationPage {
  notifications: NotificationItem[];
  hasMore: boolean;
  nextCursor: string | null;
}

export type NotificationUnreadCountResponse = number | { count: number };

export interface PushTokenStatus {
  enabled: boolean;
}

export interface RegisterPushTokenBody {
  token: string;
  platform: 'android';
}
