import type { ActivityKilometreSplit, ActivityLocation, ProfileType } from '@S/card/types';

export const ACTIVITY_MIGRATION_STATUS = {
  queued: 'queued',
  processing: 'processing',
  completed: 'completed',
  failed: 'failed',
} as const;

export type ActivityMigrationStatus = (typeof ACTIVITY_MIGRATION_STATUS)[keyof typeof ACTIVITY_MIGRATION_STATUS];

export interface ActivityMigrationJobResponse {
  jobId: string;
  status: ActivityMigrationStatus;
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

export interface ActivityPhotoResponse {
  url: string;
  thumbnail: string | null;
  blurhash?: string | null;
}

interface ActivityProfileResponse {
  name?: string | null;
  surname?: string | null;
  profilePhoto?: string | null;
  profilePhotoBlurhash?: string | null;
  emailNotifications?: boolean | null;
  user?: { email?: string | null } | null;
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
  createdAt?: string;
  updatedAt?: string;
  description?: string | null;
  title?: string | null;
  sport: string;
  photoVideoUrls?: ActivityPhotoResponse[] | null;
  mapPhotoUrl?: string | null;
  mapPhotoUrlBlurhash?: string | null;
  duration: number;
  distance: number;
  elevationGain: number;
  steps?: number | null;
  speed?: number | null;
  isPublic?: boolean | null;
  emotion?: string | null;
  kilometresSplit?: ActivityKilometreSplitResponse[] | null;
  source?: string | null;
  sourceActivityId?: string | null;
  profile: ActivityProfileResponse;
  _count: ActivityCountResponse;
}

export type ActivityListItemResponse = Pick<
  ActivityResponse,
  | 'id'
  | 'userId'
  | 'date'
  | 'title'
  | 'sport'
  | 'photoVideoUrls'
  | 'mapPhotoUrl'
  | 'mapPhotoUrlBlurhash'
  | 'duration'
  | 'distance'
  | 'elevationGain'
  | 'steps'
  | 'profile'
  | '_count'
>;

export interface ActivityMutationResponse {
  id: string;
  userId: string;
  profileId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  description?: string | null;
  title?: string | null;
  sport: string;
  photoVideoUrls?: ActivityPhotoResponse[] | null;
  mapPhotoUrl?: string | null;
  mapPhotoUrlBlurhash?: string | null;
  duration: number;
  distance: number;
  elevationGain: number;
  steps?: number | null;
  speed: number;
  isPublic?: boolean | null;
  emotion?: string | null;
  kilometresSplit?: ActivityKilometreSplitResponse[] | null;
  source?: string | null;
  sourceActivityId?: string | null;
}

export interface ActivitiesResponse {
  activities: ActivityListItemResponse[];
  currentUserProfile?: ActivityProfileResponse | null;
  hasMore: boolean;
  nextCursor: string | null;
  isLastPage?: boolean;
}

export interface ActivityMediaResponse {
  photos: ActivityPhotoResponse[];
  hasMore: boolean;
  nextCursor: string | null;
  isLastPage?: boolean;
}

export interface ActivityLocationsResponse {
  locations: ActivityLocationResponse[] | null;
  kilometresSplit: ActivityKilometreSplitResponse[] | null;
}

export interface CommentMutationResponse {
  authorId: string;
  comment: string;
  activityId: string;
  profileId: string;
  id: string;
  date: string;
}

export interface CommentLikeSummaryResponse {
  authorId: string;
  id: string;
}

interface CommentProfileResponse {
  name?: string | null;
  surname?: string | null;
  profilePhoto?: string | null;
  profilePhotoBlurhash?: string | null;
  emailNotifications?: boolean | null;
  user?: { email?: string | null } | null;
}

export interface CommentResponse {
  authorId: string;
  comment: string;
  activityId: string;
  profileId: string;
  id: string;
  date: string;
  profile: CommentProfileResponse;
  commentLike: CommentLikeSummaryResponse[];
}

export interface CommentsResponse {
  comments: CommentResponse[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface CommentLikeResponse {
  date: string;
  authorId: string;
  commentId: string;
  profileId: string;
  id: string;
}

export interface LikeResponse {
  date: string;
  authorId: string;
  id: string;
  activityId: string;
  profileId: string;
  profile?: ProfileType | null;
}

export interface LikeListResponse extends Omit<LikeResponse, 'profile'> {
  profile: ProfileType;
}

interface FriendProfileResponse {
  name?: string | null;
  surname?: string | null;
  profilePhoto?: string | null;
  profilePhotoBlurhash?: string | null;
}

export interface FollowingResponse {
  createdAt: string;
  updatedAt: string;
  userId: string;
  friendId: string;
  profileId: string;
  id: string;
  profile?: FriendProfileResponse | null;
}

export interface FollowerResponse {
  createdAt: string;
  updatedAt: string;
  userId: string;
  friendId: string;
  profileId: string;
  id: string;
  user: { profile?: FriendProfileResponse | null };
}

export interface StatisticMetricResponse {
  totalDuration: number;
  totalDistance: number;
  totalItems: number;
}

interface MonthActivityResponse {
  duration: number;
  distance: number;
  speed: number;
  date: string;
  id: string;
  sport: string;
}

export interface MonthStatisticsResponse {
  activities: MonthActivityResponse[];
  activitiesReducedBySport: Record<string, StatisticMetricResponse>;
}

export type YearStatisticsResponse = {
  isUserHasActivities: boolean;
} & Record<string, boolean | Record<string, YearCategoryStatistics>>;

export type YearCategoryStatistics = StatisticMetricResponse & Record<string, number | StatisticMetricResponse>;

export interface MessageResponse {
  message: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface ApiState {
  auth: {
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface UserAuthResponse extends AuthResponse {
  userId: string;
}

export interface LoginResponse extends UserAuthResponse {
  refreshToken: string;
}

export interface AppConfigResponse {
  appVersion: string;
}
