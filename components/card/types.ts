import { LastKmSplit } from '@R/location/types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { LocationObject } from 'expo-location';
import { MutableRefObject, ReactNode, RefObject } from 'react';

import { LikesSize } from './likes/const';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';

export type CommentType = {
  id: string;
  date: string;
  activityId: string;
  comment: string;
  authorId: string;
};

export type LikeType = {
  id: string;
  date: string;
  activityId: string;
  authorId: string;
  profile: ProfileType;
};

export type ProfileType = {
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
};

export type ActivityCardProps = {
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
  fullViewRef: MutableRefObject<ReactNode | null>;
  profile: ProfileType;
  commentsLength: number;
};

export type PhotoVideoType = { url: string; thumbnail: string | null; blurhash?: string };

export type CardBtnsProps = {
  activityId: string;
  userId: string;
  cardRef: MutableRefObject<ReactNode>;
  fullViewRef: MutableRefObject<ReactNode | null>;
  isShowDeleteBtn: boolean;
  commentsLength: number;
};

export type CommentBtnProps = {
  activityId: string;
  commentsLength: number;
};

export type ModalLikesListProps = {
  bottomSheetModalRef: RefObject<BottomSheetModal>;
  likesLength: number;
};

export type DisplayActivityMapProps = {
  locations: LocationObject[];
  kilometresSplit: LastKmSplit[];
};

export type ShareBtnProps = {
  cardRef: MutableRefObject<ReactNode>;
  fullViewRef: MutableRefObject<ReactNode>;
};

export type Likes = {
  authorId: string;
  activityId: string;
  date: string;
  id: string;
};

export type NumOfLikesProps = {
  likes: Likes[];
  error?: FetchBaseQueryError | SerializedError;
};

export type MetricsProps = {
  distance: number;
  duration: number;
  title: string;
  isShowDescription: boolean;
  description: string;
  userId: string;
  id: string;
};

export type LikesProps = {
  activityId: string;
  size: LikesSize;
};

export type PhotoVideoUrls = PhotoVideoType[];

export type MediaListProps = {
  photoVideoUrls: PhotoVideoUrls;
  mapPhotoUrl?: string;
  mapPhotoUrlBlurhash?: string;
  id: string;
};
