import type { ACTIVITY_MIGRATION_STATUS } from './migration-status';
import type { ActivityVisibility } from '@const/activity-visibility';
import type { ActivityHeartRateSample, ActivityKilometreSplit, ActivityLocation } from '@S/card/types';

type ActivityMigrationStatus = (typeof ACTIVITY_MIGRATION_STATUS)[keyof typeof ACTIVITY_MIGRATION_STATUS];

export interface ActivityMigrationJobResponse {
  jobId: string;
  status: ActivityMigrationStatus;
  uploadBytesReceived: number;
  uploadBytesTotal: number;
  queuePosition: number | null;
  queueAhead: number;
  queueSize: number;
  totalActivities: number;
  processedActivities: number;
  importedActivities: number;
  skippedActivities: number;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

type ActivityLocationResponse = ActivityLocation;

export interface ActivityMediaItemResponse {
  id?: string;
  activityId?: string;
  url: string | null;
  thumbnail: string | null;
  blurhash?: string | null;
  aspectRatio?: number | null;
  mediaReviewStatus?: 'queued' | 'processing' | 'review_required' | 'approved' | 'rejected' | 'failed' | null;
}

interface ActivityProfileResponse {
  userId?: string;
  name?: string | null;
  surname?: string | null;
  profilePhoto?: string | null;
  profilePhotoBlurhash?: string | null;
  profilePhotoReviewStatus?: 'queued' | 'processing' | 'review_required' | null;
  allowActivityInteractions?: boolean;
  allowActivityReplayViewing?: boolean;
  allowActivityHeartRateViewing?: boolean;
  allowActivityElevationViewing?: boolean;
  allowActivityPaceViewing?: boolean;
  allowActivitySharing?: boolean;
  restingHeartRate?: string | null;
  maxHeartRate?: string | null;
  age?: string | null;
}

interface ActivityCountResponse {
  comments: number;
  likes: number;
}

type ActivityKilometreSplitResponse = ActivityKilometreSplit;

export interface ActivityResponse {
  id: string;
  userId: string;
  profileId?: string;
  date: string;
  timeZone?: string | null;
  createdAt?: string;
  updatedAt?: string;
  description?: string | null;
  title?: string | null;
  textModerationStatus?: 'pending' | 'processing' | 'visible' | 'hidden' | 'removed';
  sport: string;
  media?: ActivityMediaItemResponse[] | null;
  mapPhotoUrl?: string | null;
  routeOnlyMapPhotoUrl?: string | null;
  mapPhotoUrlBlurhash?: string | null;
  hideMap?: boolean;
  locationName?: string | null;
  weatherTemperature?: number | null;
  weatherWindSpeed?: number | null;
  weatherCode?: number | null;
  caloriesActive?: number | null;
  duration: number;
  distance: number;
  elevationGain: number;
  steps?: number | null;
  averageHeartRate?: number | null;
  minHeartRate?: number | null;
  maxHeartRate?: number | null;
  speed?: number | null;
  visibility?: ActivityVisibility | null;
  isFavorite?: boolean;
  emotion?: string | null;
  kilometresSplit?: ActivityKilometreSplitResponse[] | null;
  source?: string | null;
  sourceActivityId?: string | null;
  sourceAppName?: string | null;
  recordingDeviceManufacturer?: string | null;
  recordingDeviceModel?: string | null;
  profile: ActivityProfileResponse;
  _count: ActivityCountResponse;
}

export type ActivityListItemResponse = Pick<
  ActivityResponse,
  | 'id'
  | 'userId'
  | 'date'
  | 'timeZone'
  | 'title'
  | 'textModerationStatus'
  | 'sport'
  | 'media'
  | 'mapPhotoUrl'
  | 'routeOnlyMapPhotoUrl'
  | 'mapPhotoUrlBlurhash'
  | 'hideMap'
  | 'locationName'
  | 'weatherTemperature'
  | 'weatherWindSpeed'
  | 'weatherCode'
  | 'caloriesActive'
  | 'duration'
  | 'distance'
  | 'elevationGain'
  | 'steps'
  | 'emotion'
  | 'source'
  | 'sourceAppName'
  | 'recordingDeviceManufacturer'
  | 'recordingDeviceModel'
  | 'visibility'
  | 'isFavorite'
  | 'profile'
  | '_count'
>;

export interface ActivityFavoriteMutationResponse {
  id: string;
  isFavorite: boolean;
}

export interface ActivityMutationResponse {
  id: string;
  userId: string;
  profileId: string;
  date: string;
  timeZone?: string | null;
  createdAt: string;
  updatedAt: string;
  description?: string | null;
  title?: string | null;
  textModerationStatus?: 'pending' | 'processing' | 'visible' | 'hidden' | 'removed';
  sport: string;
  media?: ActivityMediaItemResponse[] | null;
  mapPhotoUrl?: string | null;
  routeOnlyMapPhotoUrl?: string | null;
  mapPhotoUrlBlurhash?: string | null;
  hideMap?: boolean;
  locationName?: string | null;
  weatherTemperature?: number | null;
  weatherWindSpeed?: number | null;
  weatherCode?: number | null;
  caloriesActive?: number | null;
  duration: number;
  distance: number;
  elevationGain: number;
  steps?: number | null;
  speed: number;
  visibility?: ActivityVisibility | null;
  emotion?: string | null;
  kilometresSplit?: ActivityKilometreSplitResponse[] | null;
  source?: string | null;
  sourceActivityId?: string | null;
}

export interface WatchWorkoutBatchImportResponse {
  imported: number;
  skipped: number;
  activities: ActivityMutationResponse[];
}

export interface WatchWorkoutImportIdentity {
  source: 'health-connect' | 'healthkit';
  sourceActivityId: string;
  sourceAppName?: string;
  recordingDeviceManufacturer?: string;
  recordingDeviceModel?: string;
}

export interface WatchWorkoutSyncCandidatesResponse {
  workoutsToSync: WatchWorkoutImportIdentity[];
}

export interface ActivityMediaMutationResponse {
  success: true;
  media: (ActivityMediaItemResponse & { id: string; activityId: string })[];
}

export interface ActivitiesResponse {
  activities: ActivityListItemResponse[];
  currentUserProfile?: ActivityProfileResponse | null;
  hasMore: boolean;
  nextCursor: string | null;
  isLastPage?: boolean;
}

interface ActivityRouteFilterOptionsResponse {
  years: number[];
  months: number[];
  days: number[];
}

export interface ActivityRouteWorkoutListItemResponse extends ActivityListItemResponse {
  routePointCount: number;
}

export interface ActivitiesWithRoutesResponse extends Omit<ActivitiesResponse, 'activities'> {
  activities: ActivityRouteWorkoutListItemResponse[];
  availableFilters: ActivityRouteFilterOptionsResponse;
}

export interface HomeActivityFeedsResponse {
  my: ActivitiesResponse;
  followers: ActivitiesResponse;
  favorites: ActivitiesResponse;
}

export interface ActivityMediaResponse {
  media: ActivityMediaItemResponse[];
  hasMore: boolean;
  nextCursor: string | null;
  isLastPage?: boolean;
}

export interface ActivityLocationsResponse {
  locations: ActivityLocationResponse[] | null;
  kilometresSplit: ActivityKilometreSplitResponse[] | null;
}

interface ActivityChartLocationResponse {
  timestamp: number;
  coords: {
    latitude?: number | null;
    longitude?: number | null;
    altitude?: number | null;
    speed?: number | null;
    timestamp?: number | null;
  };
}

export interface ActivityChartDataResponse {
  heartRateSamples: ActivityHeartRateSample[];
  locations: ActivityChartLocationResponse[] | null;
}
