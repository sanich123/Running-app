import type { ActivityInitialState } from './types';
import type { FinishedActivity } from '@R/services/activity/types';

export const FINISHED_ACTIVITY_INITIAL_STATE: FinishedActivity = {
  locations: [],
  duration: 0,
  speed: 0,
  distance: 0,
  kilometresSplit: [],
};

export const ACTIVITY_INITIAL_STATE: ActivityInitialState = {
  isDisabledWhileSending: false,
  finishedActivity: FINISHED_ACTIVITY_INITIAL_STATE,
};
