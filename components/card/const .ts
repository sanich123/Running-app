import { LocationObject } from 'expo-location';

import { SPORTS_BTNS_VALUES } from '../sports-btns/const';

export type ActivityCardProps = {
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
};
