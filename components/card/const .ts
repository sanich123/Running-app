import { MutableRefObject, ReactNode } from 'react';

import { SPORTS_BTNS_VALUES } from '../sports-btns/const';

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
};

export type ProfileType = {
  bio: string;
  birthday: Date | null;
  city: string;
  createdAt: Date;
  email: string | null;
  gender: string;
  id: string;
  language: string | null;
  name: string;
  profilePhoto: string;
  sport: string | null;
  surname: string;
  updatedAt: Date;
  user_id: string;
  weight: string;
};

export type ActivityCardProps = {
  isShowDeleteBtn: boolean;
  isShowDescription: boolean;
  description: string;
  title: string;
  date: Date;
  sport: SPORTS_BTNS_VALUES;
  id: string;
  userId: string;
  photoVideoUrls: { url: string; thumbnail: string | null }[];
  mapPhotoUrl?: string;
  duration: number;
  distance: number;
  fullViewRef: MutableRefObject<ReactNode | null>;
  comments: CommentType[];
  likes: LikeType[];
  profile: ProfileType;
};
