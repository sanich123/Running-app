import type { ModerationActionType } from '@R/services/moderation/types';

export type ModerationTab = 'reports' | 'appeals';
export type ReportFilter = 'all' | 'open' | 'in_review';

export type PendingDecision =
  | { kind: 'action'; action: ModerationActionType }
  | { kind: 'appeal'; appealId: string; decision: 'upheld' | 'rejected' };
