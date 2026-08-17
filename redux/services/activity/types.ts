import type { SPORTS_BTNS_VALUES } from '@const/sports';
export type { ActivityMutationResponse } from '@R/runich-api/types';
import type { ActivitiesResponse } from '@R/runich-api/types';
import type { LastKmSplit } from '@R/slices/location/types';
import type { EMOTIONS_BTNS_VALUES } from '@Routes/save-activity-page/emotion-btns/const';
import type { LocationObject } from 'expo-location';

export type {
  ActivitiesResponse,
  ActivityLocationsResponse,
  ActivityMediaResponse,
  ActivityMutationResponse,
  ActivityResponse,
} from '@R/runich-api/types';

export interface FinishedActivity {
  date?: string;
  locations: LocationObject[];
  duration: number;
  speed: number;
  distance: number;
  kilometresSplit?: LastKmSplit[];
}

export interface ActivityAdditionalInfo {
  title: string;
  description: string;
  sport: SPORTS_BTNS_VALUES;
  emotion: EMOTIONS_BTNS_VALUES;
  isPublic: boolean;
  photoVideoUrls: { url: string; thumbnail: null | string; blurhash?: string | null }[];
}

export interface ActivityToSend {
  body: FinishedActivity & ActivityAdditionalInfo;
  id: string;
}

export interface ActivityUpdateRequest {
  id: string;
  body: Partial<FinishedActivity & ActivityAdditionalInfo>;
}

export interface GetActivityPhotosRequest {
  userId: string;
  take: number;
}

export interface GetActivitiesByIdsRequest {
  ids: string;
}

/** Kept as an alias for existing imports. */
