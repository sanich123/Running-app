export type UserReportTargetType = 'activity' | 'comment' | 'media' | 'user';
export type ContentReportTargetType = UserReportTargetType | 'media_upload';

export type ContentReportReason =
  'threats' | 'harassment' | 'hate_speech' | 'sexual_content' | 'violence' | 'spam' | 'other';

export interface SubmitContentReportRequest {
  targetType: UserReportTargetType;
  targetId: string;
  reason: ContentReportReason;
  details?: string;
}

export interface BlockedUserItem {
  blockedUserId: string;
  createdAt: string;
  profile: {
    name: string | null;
    surname: string | null;
    profilePhoto: string | null;
    profilePhotoBlurhash: string | null;
  } | null;
}

export interface BlockedUsersResponse {
  items: BlockedUserItem[];
}

export type ContentReportStatus = 'open' | 'in_review' | 'resolved' | 'rejected' | 'appealed';
export type ModerationActionType =
  | 'hide_content'
  | 'remove_content'
  | 'restore_content'
  | 'warn_user'
  | 'temporary_suspend'
  | 'permanent_suspend'
  | 'reject_report'
  | 'appeal_submitted'
  | 'appeal_upheld'
  | 'appeal_rejected'
  | 'approve_media'
  | 'reject_media';

export interface ModerationReportItem {
  id: string;
  reporterId: string | null;
  targetType: ContentReportTargetType;
  targetId: string;
  subjectUserId: string | null;
  reason: ContentReportReason;
  details: string | null;
  status: ContentReportStatus;
  priority: string;
  assignedModeratorId: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface ModerationReportAction {
  id: string;
  reportId: string;
  actorId: string | null;
  action: ModerationActionType;
  note: string | null;
  createdAt: string;
}

export interface ModerationReportContext {
  title?: string | null;
  description?: string | null;
  comment?: string | null;
  authorId?: string | null;
  userId?: string | null;
  name?: string | null;
  surname?: string | null;
  profilePhoto?: string | null;
  url?: string | null;
  thumbnail?: string | null;
  media?: { id: string; url: string | null; thumbnail: string | null }[] | null;
  activityId?: string | null;
  moderationStatus?:
    'visible' | 'hidden' | 'removed' | 'queued' | 'processing' | 'review_required' | 'approved' | 'rejected' | 'failed';
  scores?: Record<string, number> | null;
  frameCount?: number | null;
  modelVersion?: string | null;
  contentType?: string | null;
}

export interface ModerationReportDetails {
  report: ModerationReportItem;
  context: ModerationReportContext | null;
  actions: ModerationReportAction[];
}

export interface ModerationAppealItem {
  id: string;
  reportId: string;
  appellantId: string | null;
  reason: string;
  createdAt: string;
  status: 'pending' | 'upheld' | 'rejected';
}

export interface ModerationActionRequest {
  action: ModerationActionType;
  note?: string;
  suspensionDays?: number;
}

export interface ModerationAppealDecisionRequest {
  decision: 'upheld' | 'rejected';
  note?: string;
}
