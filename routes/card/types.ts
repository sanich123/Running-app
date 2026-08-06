import type { MutableRefObject, RefObject } from 'react';
import type { View } from 'react-native';
import type { LikesSize } from './likes/const';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { LastKmSplit } from '@R/slices/location/types';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SPORTS_BTNS_VALUES } from '@Routes/save-activity-page/sports-btns/const';
import type { LocationObject } from 'expo-location';

export interface CommentType {
  id: string;
  date: string;
  activityId: string;
  comment: string;
  authorId: string;
}

export interface LikeType {
  id: string;
  date: string;
  activityId: string;
  authorId: string;
  profile: ProfileType;
}

export interface ProfileType {
  bio: string;
  birthday: string | null;
  city: string;
  createdAt: string;
  email: string | null;
  gender: string;
  id: string;
  language: string | null;
  name: string;
  profilePhoto: string;
  profilePhotoBlurhash: string;
  sport: string | null;
  surname: string;
  updatedAt: string;
  user_id: string;
  weight: string;
  emailNotifications: boolean;
  users: { email: string };
}

export interface ActivityCardProps {
  isShowDeleteBtn: boolean;
  isShowDescription: boolean;
  description: string;
  title: string;
  date: string;
  sport: SPORTS_BTNS_VALUES;
  id: string;
  userId: string;
  photoVideoUrls: PhotoVideoType[];
  mapPhotoUrl?: string;
  mapPhotoUrlBlurhash?: string;
  duration: number;
  distance: number;
  profile: ProfileType;
  commentsLength: number;
}

export interface PhotoVideoType {
  url: string;
  thumbnail: string | null;
  blurhash?: string;
}

export interface CardBtnsProps {
  activityId: string;
  userId: string;
  cardRef: MutableRefObject<View | null>;
  isShowDeleteBtn: boolean;
  commentsLength: number;
  profile: ProfileType;
  mapPhotoUrl?: string;
}

export interface CommentBtnProps {
  activityId: string;
  commentsLength: number;
  profile: ProfileType;
  mapPhotoUrl?: string;
}

export interface ModalLikesListProps {
  bottomSheetModalRef: RefObject<BottomSheetModal | null>;
  likesLength: number;
}

export interface DisplayActivityMapProps {
  locations: LocationObject[];
  kilometresSplit: LastKmSplit[];
}

export interface ShareBtnProps {
  cardRef: MutableRefObject<View | null>;
}

export interface Likes {
  authorId: string;
  activityId: string;
  date: string;
  id: string;
}

export interface LikeBtnProps {
  activityId: string;
  profile: ProfileType;
  mapPhotoUrl?: string;
}

export interface NumOfLikesProps {
  likes: Likes[];
  error?: FetchBaseQueryError | SerializedError;
}

export interface MetricsProps {
  distance: number;
  duration: number;
  title: string;
  isShowDescription: boolean;
  description: string;
  userId: string;
  id: string;
}

export interface LikesProps {
  activityId: string;
  size: LikesSize;
}

export type PhotoVideoUrls = PhotoVideoType[];

export interface MediaListProps {
  photoVideoUrls: PhotoVideoUrls;
  mapPhotoUrl?: string;
  mapPhotoUrlBlurhash?: string;
  id: string;
}
