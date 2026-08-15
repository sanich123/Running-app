import type { MutableRefObject, RefObject } from 'react';
import type { View } from 'react-native';
import type { LikesSize } from './likes/const';
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
  created_at?: string | null;
  createdAt?: string | null;
  email?: string | null;
  gender?: string | null;
  id?: string;
  language?: string | null;
  name?: string | null;
  profilePhoto?: string | null;
  profilePhotoBlurhash?: string | null;
  sport?: string | null;
  surname?: string | null;
  updatedAt?: string | null;
  user_id?: string;
  weight?: string | null;
  emailNotifications?: boolean | null;
  users?: { email?: string | null } | null;
}

export interface ActivityCardProps {
  isFullView?: boolean;
  isShowDeleteBtn: boolean;
  isShowDescription: boolean;
  description?: string | null;
  title?: string | null;
  date: string;
  sport: SPORTS_BTNS_VALUES | string;
  id: string;
  userId: string;
  photoVideoUrls?: PhotoVideoType[] | null;
  mapPhotoUrl?: string | null;
  mapPhotoUrlBlurhash?: string | null;
  locations?: ActivityLocation[] | null;
  duration: number;
  distance: number;
  profile: ProfileType;
  commentsLength: number;
}

export interface PhotoVideoType {
  url: string;
  thumbnail: string | null;
  blurhash?: string | null;
}

export interface CardBtnsProps {
  activityId: string;
  userId: string;
  cardRef: MutableRefObject<View | null>;
  isShowDeleteBtn: boolean;
  commentsLength: number;
  profile: ProfileType;
  mapPhotoUrl?: string | null;
}

export interface CommentBtnProps {
  activityId: string;
  commentsLength: number;
  profile: ProfileType;
  mapPhotoUrl?: string | null;
}

export interface ModalLikesListProps {
  bottomSheetModalRef: RefObject<BottomSheetModal | null>;
  likesLength: number;
}

export interface DisplayActivityMapProps {
  locations: ActivityLocation[];
  kilometresSplit: ActivityKilometreSplit[];
}

export interface ShareBtnProps {
  cardRef: MutableRefObject<View | null>;
}

interface Likes {
  authorId: string;
  activityId: string;
  date: string;
  id: string;
}

export interface LikeBtnProps {
  activityId: string;
  profile: ProfileType;
  mapPhotoUrl?: string | null;
}

export interface NumOfLikesProps {
  likes: Likes[];
  error?: FetchBaseQueryError | SerializedError;
}

export interface MetricsProps {
  distance: number;
  duration: number;
  title?: string | null;
  isShowDescription: boolean;
  description?: string | null;
  userId: string;
  id: string;
}

export interface LikesProps {
  activityId: string;
  size: LikesSize;
}

type PhotoVideoUrls = PhotoVideoType[];

export interface MediaListProps {
  photoVideoUrls?: PhotoVideoUrls | null;
  mapPhotoUrl?: string | null;
  mapPhotoUrlBlurhash?: string | null;
  id: string;
}
