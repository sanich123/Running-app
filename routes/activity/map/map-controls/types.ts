import type { RefObject } from 'react';
import type { Camera } from '@rnmapbox/maps';

export interface MapControlsProps {
  cameraRef: RefObject<Camera | null>;
  mapZoomLevel: number;
  isCenteringOnCurrentLocation: boolean;
  hasPoorLocationAccuracy: boolean;
  locationAccuracy: number;
  onZoomLevelChange: (zoomLevel: number) => void;
  onFollowUserLocationChange: (shouldFollow: boolean) => void;
  onCenterOnCurrentLocation: () => void;
}
