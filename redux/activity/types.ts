import { EMOTIONS_BTNS_VALUES } from '@C/save-activity-page/emotion-btns/const';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { LastKmSplit } from '@R/location/types';
import { LocationObject } from 'expo-location';

export interface FinishedActivity {
  date?: Date;
  locations: LocationObject[];
  duration: number;
  speed: number;
  distance: number;
  kilometresSplit?: LastKmSplit[];
}

export interface AdditionalInfoType {
  title: string;
  description: string;
  sport: SPORTS_BTNS_VALUES;
  emotion: EMOTIONS_BTNS_VALUES;
  isPublic: boolean;
  photoVideoUrls: { url: string; thumbnail: null | string; blurhash?: string }[];
}

export interface ManualData {
  manualDate: Date;
  manualHours: number;
  manualMinutes: number;
  manualDistance: number;
}

export type ActivityToSend = {
  body: FinishedActivity & AdditionalInfoType;
  id: string;
};

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
  manualDate: Date | null;
  manualHours: number;
  manualMinutes: number;
  manualDistance: number;
  activityId: string;
}
