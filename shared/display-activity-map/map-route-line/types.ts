import type { ActivityLocation } from '@S/card/types';

export interface MapRouteLineProps {
  locations?: ActivityLocation[] | ActivityLocation[][];
  segmentColors?: string[];
  variant?: 'activity' | 'navigation';
}
