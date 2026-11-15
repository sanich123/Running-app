import type { ModerationActionType } from '@R/services/moderation/types';

export type ModerationTab = 'reports' | 'appeals';
export type ReportFilter = 'new' | 'processed';

export type PendingDecision =
  | { kind: 'action'; action: ModerationActionType }
  | { kind: 'delete-report'; reportId: string }
  | { kind: 'appeal'; appealId: string; decision: 'upheld' | 'rejected' };
