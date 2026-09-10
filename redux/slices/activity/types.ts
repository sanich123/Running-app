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
  url: string;
  thumbnail: string | null;
  blurhash?: string | null;
}

export interface ActivityState {
  isSavingDisabled: boolean;
  finishedActivity: FinishedActivityDraft;
  sport: SPORTS_BTNS_VALUES;
  photoVideoUrls: ActivityPhoto[];
  unsyncedActivities: PendingActivity[];
}
