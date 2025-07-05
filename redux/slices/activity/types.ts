import { ActivityToSend, AdditionalInfoType, FinishedActivity } from '@R/services/activity/types';

export interface ManualData {
  manualDate: string;
  manualHours: number;
  manualMinutes: number;
  manualDistance: number;
}
export type UnsyncedActivities = ActivityToSend[];
export interface ActivityInitialState {
  isDisabledWhileSending: boolean;
  isHaveUnsyncedActivity: boolean;
  isManualAdding: boolean;
  isEditingActivity: boolean;
  isCameraVisible: boolean;
  finishedActivity: FinishedActivity;
  additionalInfo: AdditionalInfoType;
  unsyncedActivities: UnsyncedActivities;
  manualDate: string;
  manualHours: number;
  manualMinutes: number;
  manualDistance: number;
  activityId: string;
}
