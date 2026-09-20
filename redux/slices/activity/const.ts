import { SPORTS_BTNS_VALUES } from '@const/sports';
import type { ActivityState, FinishedActivityDraft } from './types';

export const FINISHED_ACTIVITY_INITIAL_STATE: FinishedActivityDraft = {
  duration: 0,
  speed: 0,
  distance: 0,
  kilometresSplit: [],
  routeJournalId: null,
};

export const ACTIVITY_DRAFT_INITIAL_STATE = {
  sport: SPORTS_BTNS_VALUES.run,
  media: [],
};

export const ACTIVITY_INITIAL_STATE: ActivityState = {
  isSavingDisabled: false,
  finishedActivity: FINISHED_ACTIVITY_INITIAL_STATE,
  ...ACTIVITY_DRAFT_INITIAL_STATE,
  unsyncedActivities: [],
};
