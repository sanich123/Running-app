import type { FinishedActivity } from '@R/services/activity/types';

export interface ActivityInitialState {
  isDisabledWhileSending: boolean;
  finishedActivity: FinishedActivity;
  activityId: string;
}
