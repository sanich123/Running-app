import type { ActivityToSend, FinishedActivity } from '@R/services/activity/types';

export interface ManualData {
  manualDate: string;
  manualHours: number;
  manualMinutes: number;
  manualDistance: number;
}
export type UnsyncedActivities = ActivityToSend[];

export interface ActivityInitialState {
  isDisabledWhileSending: boolean;
  finishedActivity: FinishedActivity;
  activityId: string;
}
