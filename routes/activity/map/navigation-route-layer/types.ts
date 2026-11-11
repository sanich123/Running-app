import type { RefObject } from 'react';
import type { Camera } from '@rnmapbox/maps';

export interface NavigationRouteLayerProps {
  cameraRef: RefObject<Camera | null>;
  canRenderMap: boolean;
  hasMapLoaded: boolean;
}
