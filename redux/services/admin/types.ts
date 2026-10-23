export type AdminRole = 'moderator' | 'email_sender' | 'access_manager' | 'superuser';

export type AdminPermission = 'moderation.manage' | 'email.send' | 'admin.roles.manage';

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
