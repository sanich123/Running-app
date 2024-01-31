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

export type ActivityCardProps = {
  isShowDeleteBtn: boolean;
  isShowDescription: boolean;
  description: string;
  title: string;
  date: Date;
  sport: SPORTS_BTNS_VALUES;
  id: string;
  userId: string;
  photoUrls: string[];
  duration: number;
  distance: number;
  fullViewRef: MutableRefObject<ReactNode | null>;
};
