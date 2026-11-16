import type { FeedbackTopic } from '../feedback/feedback';

export type AdminRole = 'moderator' | 'email_sender' | 'access_manager' | 'superuser';

type AdminPermission = 'moderation.manage' | 'feedback.manage' | 'email.send' | 'admin.roles.manage';

export type AdminFeedbackStatus = 'open' | 'in_progress' | 'resolved';

export interface AdminAccess {
  roles: AdminRole[];
  permissions: AdminPermission[];
  isSuperuser: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  roles: AdminRole[];
}

export interface AdminAccessAuditItem {
  id: string;
  actorEmail: string;
  targetEmail: string;
  role: AdminRole;
  action: 'granted' | 'revoked';
  createdAt: string;
}

export interface AdminFeedbackItem {
  id: string;
  email: string;
  kind: string;
  topic: FeedbackTopic | null;
  text: string;
  deviceInfo: string;
  attachments: { url: string; thumbnail: string | null }[];
  status: AdminFeedbackStatus;
  createdAt: string;
  updatedAt: string;
  replies?: {
    id: string;
    text: string;
    adminEmail: string;
    deliveryStatus: 'pending' | 'sent' | 'failed';
    createdAt: string;
  }[];
}
