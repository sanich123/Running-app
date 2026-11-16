import type { ActivityMapMarkerType } from '../const';
import type { ActivityLocation } from '@S/card/types';

export interface ActivityMapMarkerProps {
  location: ActivityLocation;
  type: ActivityMapMarkerType;
}
