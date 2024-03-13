import { EMOTIONS_BTNS_VALUES } from '@C/emotion-btns/const';
import { SPORTS_BTNS_VALUES } from '@C/sports-btns/const';

import { FinishedActivity, ActivityInitialState, AdditionalInfoType } from './types';

export const FINISHED_ACTIVITY_INITIAL_STATE: FinishedActivity = {
  locations: [],
  duration: 0,
  speed: 0,
  distance: 0,
  kilometresSplit: [],
};

export const ADDITIONAL_INFO_INITIAL_STATE: AdditionalInfoType = {
  title: '',
  description: '',
  sport: SPORTS_BTNS_VALUES.run,
  emotion: EMOTIONS_BTNS_VALUES.normal,
  isPublic: true,
  photoVideoUrls: [],
};

export const ACTIVITY_INITIAL_STATE: ActivityInitialState = {
  isDisabledWhileSending: false,
  isHaveUnsyncedActivity: false,
  isManualAdding: false,
  isEditingActivity: false,
  isCameraVisible: false,
  activityId: '',
  finishedActivity: FINISHED_ACTIVITY_INITIAL_STATE,
  additionalInfo: ADDITIONAL_INFO_INITIAL_STATE,
  unsyncedActivities: [],
  manualDate: null,
  manualHours: 0,
  manualMinutes: 0,
  manualDistance: 0,
};
