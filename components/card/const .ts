import { LocationObject } from 'expo-location';
import { MutableRefObject, ReactNode } from 'react';

import { SPORTS_BTNS_VALUES } from '../sports-btns/const';

export type ActivityCardProps = {
  isShowDeleteBtn: boolean;
  isShowDescription: boolean;
  description: string;
  title: string;
  date: Date;
  sport: SPORTS_BTNS_VALUES;
  id: string;
  userId: string;
  locations: LocationObject[];
  photoUrls: string[];
  duration: number;
  distance: number;
  fullViewRef: MutableRefObject<ReactNode | null>;
};
