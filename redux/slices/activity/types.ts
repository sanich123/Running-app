import type { SPORTS_BTNS_VALUES } from '@const/sports';
import type { FinishedActivity, ActivityToSend } from '@R/services/activity/types';

export interface ActivityPhoto {
  url: string;
  thumbnail: string | null;
  blurhash?: string | null;
}

export interface ActivityState {
  isSavingDisabled: boolean;
  finishedActivity: FinishedActivity;
  sport: SPORTS_BTNS_VALUES;
  photoVideoUrls: ActivityPhoto[];
  unsyncedActivities: ActivityToSend[];
}
