import type { RefObject } from 'react';
import type { SPORTS_BTNS_VALUES } from '@const/sports';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface ActivityLocation {
  coords: {
    latitude: number;
    longitude: number;
    altitude?: number | null;
    accuracy?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
    timestamp?: number | null;
    mocked?: boolean | null;
  };
  timestamp?: number;
  mocked?: boolean | null;
}

export interface ActivityKilometreSplit {
  lastKilometerDuration: number;
  lastKilometerAltitude: number;
  kilometerPoint: ActivityLocation;
  lastKilometerSteps?: number | null;
}

export interface LikeType {
  id: string;
  date: string;
  activityId: string;
  authorId: string;
  profile?: ProfileType | null;
}

export interface ProfileType {
  bio?: string | null;
  birthday?: string | null;
  city?: string | null;
  createdAt?: string | null;
  email?: string | null;
  gender?: string | null;
  height?: string | null;
  age?: string | null;
  id?: string;
  language?: string | null;
  name?: string | null;
  profilePhoto?: string | null;
  profilePhotoBlurhash?: string | null;
  sport?: string | null;
  surname?: string | null;
  updatedAt?: string | null;
  userId?: string;
  weight?: string | null;
  emailNotifications?: boolean | null;
  profileSearchVisible?: boolean;
  allowActivityInteractions?: boolean;
  allowLikesListViewing?: boolean;
  hideActivityStatistics?: boolean;
  hideFollowingList?: boolean;
  hideProfilePhotos?: boolean;
  user?: { email?: string | null } | null;
}

export interface ActivityCardData {
  description?: string | null;
  title?: string | null;
  date: string;
  sport: SPORTS_BTNS_VALUES | string;
  id: string;
  userId: string;
  media?: ActivityMediaItem[] | null;
  mapPhotoUrl?: string | null;
  mapPhotoUrlBlurhash?: string | null;
  locationName?: string | null;
  weatherTemperature?: number | null;
  weatherWindSpeed?: number | null;
  weatherCode?: number | null;
  caloriesActive?: number | null;
  duration: number;
  distance: number;
  elevationGain: number;
  steps?: number | null;
  emotion?: string | null;
  profile: ProfileType;
  commentsLength: number;
  likesLength?: number;
}

export interface ActivityCardProps {
  activity: ActivityCardData;
  isFullView?: boolean;
  isShowDeleteBtn: boolean;
  isShowDescription: boolean;
}

export interface ActivityMediaItem {
  id?: string;
  activityId?: string;
  url: string;
  thumbnail: string | null;
  blurhash?: string | null;
}

export interface ModalLikesListProps {
  bottomSheetModalRef: RefObject<BottomSheetModal | null>;
  likesLength: number;
  canViewLikes: boolean;
}

export interface DisplayActivityMapProps {
  locations: ActivityLocation[];
  kilometresSplit: ActivityKilometreSplit[];
}

interface Likes {
  authorId: string;
  activityId: string;
  date: string;
  id: string;
}

export interface NumberOfLikesProps {
  likes: Likes[];
  likesLength?: number;
  error?: FetchBaseQueryError | SerializedError;
}
