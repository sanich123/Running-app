import { SPORTS_BTNS_VALUES } from '@const/sports';
import { EMOTIONS_BTNS_VALUES } from '@Routes/save-activity-page/emotion-btns/const';
import type { ActivityInitialState } from './types';
import type { AdditionalInfoType, FinishedActivity } from '@R/services/activity/types';

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
  activityId: '',
  finishedActivity: FINISHED_ACTIVITY_INITIAL_STATE,
};
