import type { ComponentRef, MutableRefObject } from 'react';
import type { View } from 'react-native';
import type { ActivityCardData } from '../types';

export type ShareActivityImageProps = Pick<
  ActivityCardData,
  'distance' | 'duration' | 'date' | 'title' | 'mapPhotoUrl' | 'mapPhotoUrlBlurhash'
> & {
  profile?: ActivityCardData['profile'];
  sport?: string;
  emotion?: string | null;
  elevationGain?: number;
  steps?: number | null;
  locationName?: string | null;
  weatherTemperature?: number | null;
  weatherWindSpeed?: number | null;
  weatherCode?: number | null;
  caloriesActive?: number | null;
  cardRef: MutableRefObject<ComponentRef<typeof View> | null>;
  onReady?: () => void;
};
