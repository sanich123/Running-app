import { EMOTIONS_BTNS_VALUES } from '@C/emotion-btns/const';
import { SPORTS_BTNS_VALUES } from '@C/sports-btns/const';
import { LastKmSplit } from '@const/types/location';
import { LocationObject } from 'expo-location';

export interface FinishedActivity {
  locations: LocationObject[];
  duration: number;
  speed: number;
  distance: number;
  kilometresSplit: LastKmSplit[];
}

export interface AdditionalInfoType {
  title: string;
  description: string;
  sport: SPORTS_BTNS_VALUES;
  emotion: EMOTIONS_BTNS_VALUES;
  isSwitchOn: boolean;
  photoUrls: string[];
}

export interface ManualData {
  manualDate: Date;
  manualHours: number;
  manualMinutes: number;
  manualDistance: number;
}

export type UnsyncedActivities = (FinishedActivity & AdditionalInfoType)[] | (AdditionalInfoType & ManualData)[];

export interface ActivityInitialState {
  isNeedToResetInputs: boolean;
  isDisabledWhileSending: boolean;
  isHaveUnsyncedActivity: boolean;
  isManualAdding: boolean;
  isCameraVisible: boolean;
  finishedActivity: FinishedActivity;
  additionalInfo: AdditionalInfoType;
  unsyncedActivities: UnsyncedActivities;
  manualDate: Date;
  manualHours: number;
  manualMinutes: number;
  manualDistance: number;
}
