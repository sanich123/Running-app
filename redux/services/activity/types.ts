import type { ActivityVisibility } from '@const/activity-visibility';
import type { SPORTS_BTNS_VALUES } from '@const/sports';
import type { LastKmSplit } from '@R/slices/location/types';
import type { EMOTIONS_BTNS_VALUES } from '@Routes/save-activity-page/emotion-btns/const';
import type { LocationObject } from 'expo-location';

export interface FinishedActivity {
  date?: string;
  timeZone?: string;
  locations: LocationObject[];
  duration: number;
  speed: number;
  distance: number;
  steps?: number;
  kilometresSplit?: LastKmSplit[];
}

interface ActivityAdditionalInfo {
  title: string;
  description: string;
  sport: SPORTS_BTNS_VALUES;
  emotion: EMOTIONS_BTNS_VALUES;
  visibility: ActivityVisibility;
  media: { url: string; thumbnail: null | string; blurhash?: string | null }[];
  timeZone: string;
}

export interface ActivityToSend {
  body: FinishedActivity & ActivityAdditionalInfo;
  id: string;
}

export interface WatchWorkoutToSend extends FinishedActivity {
  source: 'health-connect' | 'healthkit';
  sourceActivityId: string;
  sport: SPORTS_BTNS_VALUES | string;
  title?: string;
}

export interface WatchWorkoutsImportRequest {
  id: string;
  workouts: WatchWorkoutToSend[];
}

type ActivityEditableInfo = Pick<ActivityAdditionalInfo, 'title' | 'description' | 'sport' | 'emotion' | 'visibility'>;
type ActivityEditableMetrics = Pick<FinishedActivity, 'date' | 'distance' | 'duration' | 'speed'>;

export interface ActivityUpdateRequest {
  id: string;
  body: Partial<ActivityEditableInfo & ActivityEditableMetrics>;
}

export interface AppendActivityMediaRequest {
  id: string;
  media: ActivityAdditionalInfo['media'];
}

export interface DeleteActivityMediaRequest {
  activityId: string;
  mediaId: string;
}

export interface GetActivityLocationsRequest {
  activityId: string;
  replay?: boolean;
}

export interface GetActivityMediaRequest {
  userId: string;
  take: number;
}

export interface GetActivitiesByIdsRequest {
  ids: string;
}

export interface SetActivityFavoriteRequest {
  id: string;
  isFavorite: boolean;
}

/** Kept as an alias for existing imports. */
