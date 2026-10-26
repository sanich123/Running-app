import type { ProfileType } from '@S/card/types';

export interface ProfileSettings {
  gender?: string;
  name?: string;
  surname?: string;
  city?: string;
  weight?: string;
  restingHeartRate?: string;
  maxHeartRate?: string;
  height?: string;
  age?: string;
  bio?: string;
  profilePhoto?: string;
  profilePhotoAssetId?: string;
  profilePhotoBlurhash?: string | null;
  email?: string;
  birthday?: string;
  sport?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  inAppNotifications?: boolean;
  profileSearchVisible?: boolean;
  allowActivityInteractions?: boolean;
  allowActivityReplayViewing?: boolean;
  allowActivityHeartRateViewing?: boolean;
  allowActivityElevationViewing?: boolean;
  allowActivityPaceViewing?: boolean;
  allowActivitySharing?: boolean;
  hideActivityStatistics?: boolean;
  hideFollowingList?: boolean;
  hideProfilePhotos?: boolean;
  allowNewFollowers?: boolean;
}

export type ProfileResponse = ProfileType;

export interface FilteredProfilesResponse {
  items: (ProfileResponse & { userId: string })[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface SendProfile {
  body: ProfileSettings;
  id: string;
}
