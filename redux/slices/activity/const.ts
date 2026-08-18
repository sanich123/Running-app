import { SPORTS_BTNS_VALUES } from '@const/sports';
import type { ActivityState } from './types';
import type { FinishedActivity } from '@R/services/activity/types';

export const FINISHED_ACTIVITY_INITIAL_STATE: FinishedActivity = {
  locations: [],
  duration: 0,
  speed: 0,
  distance: 0,
  kilometresSplit: [],
};

export const ACTIVITY_DRAFT_INITIAL_STATE = {
  sport: SPORTS_BTNS_VALUES.run,
  photoVideoUrls: [],
};

export const ACTIVITY_INITIAL_STATE: ActivityState = {
  isSavingDisabled: false,
  finishedActivity: FINISHED_ACTIVITY_INITIAL_STATE,
  ...ACTIVITY_DRAFT_INITIAL_STATE,
  unsyncedActivities: [],
};
