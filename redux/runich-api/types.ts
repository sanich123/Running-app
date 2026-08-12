import type { ProfileType } from '@S/card/types';
import type { LocationObject } from 'expo-location';

export interface ActivityPhotoResponse {
  url: string;
  thumbnail: string | null;
  blurhash?: string | null;
}

export interface ActivityProfileResponse {
  name?: string | null;
  surname?: string | null;
  profilePhoto?: string | null;
  profilePhotoBlurhash?: string | null;
  emailNotifications?: boolean | null;
  users?: { email?: string | null } | null;
}

export interface ActivityCountResponse {
  comments: number;
}

export interface ActivityKilometreSplitResponse {
  lastKilometerDuration: number;
  lastKilometerAltitude: number;
  kilometerPoint: LocationObject;
}

export interface ActivityResponse {
  id: string;
  user_id: string;
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
  speed?: number | null;
  isPublic?: boolean | null;
  emotion?: string | null;
  locations?: LocationObject[] | null;
  kilometresSplit?: ActivityKilometreSplitResponse[] | null;
  source?: string | null;
  sourceActivityId?: string | null;
  profile: ActivityProfileResponse;
  _count: ActivityCountResponse;
}

export interface ActivityMutationResponse {
  id: string;
  user_id: string;
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
  speed: number;
  isPublic?: boolean | null;
  emotion?: string | null;
  locations?: LocationObject[] | null;
  kilometresSplit?: ActivityKilometreSplitResponse[] | null;
  source?: string | null;
  sourceActivityId?: string | null;
}

export interface ActivitiesResponse {
  activities: ActivityResponse[];
  isLastPage: boolean;
}

export interface ActivityMediaResponse {
  photos: ActivityPhotoResponse[];
  isLastPage: boolean;
}

export interface ActivityLocationsResponse {
  locations: LocationObject[] | null;
  kilometresSplit: ActivityKilometreSplitResponse[] | null;
}

export interface CommentLikeSummaryResponse {
  authorId: string;
  id: string;
}

export interface CommentProfileResponse {
  name?: string | null;
  surname?: string | null;
  profilePhoto?: string | null;
  profilePhotoBlurhash?: string | null;
  emailNotifications?: boolean | null;
  users?: { email?: string | null } | null;
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
  allCommentsLength: number;
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

export interface FriendProfileResponse {
  name?: string | null;
  surname?: string | null;
  profilePhoto?: string | null;
  profilePhotoBlurhash?: string | null;
}

export interface FollowingResponse {
  createdAt: string;
  updatedAt: string;
  user_id: string;
  friendId: string;
  profileId: string;
  id: string;
  profile?: FriendProfileResponse | null;
}

export interface FollowerResponse {
  createdAt: string;
  updatedAt: string;
  user_id: string;
  friendId: string;
  profileId: string;
  id: string;
  users?: { profile?: FriendProfileResponse | null } | null;
}

export interface PaginationResponse<T> {
  totalItems: number;
  page: number;
  size: number;
  items: T[];
}

export interface StatisticMetricResponse {
  totalDuration: number;
  totalDistance: number;
  totalItems: number;
}

export interface MonthActivityResponse {
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
