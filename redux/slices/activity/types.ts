import type { SPORTS_BTNS_VALUES } from '@const/sports';
import type { FinishedActivity, ActivityToSend } from '@R/services/activity/types';

export type FinishedActivityDraft = Omit<FinishedActivity, 'locations'> & {
  routeJournalId: string | null;
};

export interface PendingActivity {
  id: string;
  routeJournalId: string | null;
  body: Omit<ActivityToSend['body'], 'locations'>;
}

export interface ActivityPhoto {
  id?: string;
  activityId?: string;
  url?: string | null;
  thumbnail?: string | null;
  blurhash?: string | null;
  assetId?: string;
  thumbnailAssetId?: string;
  mediaReviewStatus?: 'queued' | 'processing' | 'review_required' | 'approved' | 'rejected' | 'failed' | null;
  contentType?: string;
}

export interface ActivityState {
  isSavingDisabled: boolean;
  finishedActivity: FinishedActivityDraft;
  sport: SPORTS_BTNS_VALUES;
  media: ActivityPhoto[];
  unsyncedActivities: PendingActivity[];
}
