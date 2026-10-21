import type { WebMapControlsHandle } from '../map-controls/types';
import type { ActivityKilometreSplit, ProfileType } from '@S/card/types';

export interface MapboxWebProps {
  boundBox: [number, number, number, number];
  routeCoordinates: number[][];
  routeSegmentColors?: string[];
  kilometresSplit: ActivityKilometreSplit[];
  kilometreUnit?: string;
  showPlaybackMarker?: boolean;
  playbackCoordinate?: [number, number] | null;
  playbackHeading?: number;
  playbackCameraUpdateRef?: {
    current:
      | ((coordinate: [number, number], heading: number, zoomLevel?: number, animationDurationMs?: number) => void)
      | null;
  };
  playbackProfile?: Pick<ProfileType, 'name' | 'surname' | 'profilePhoto'>;
  mapControlsRef?: { current: WebMapControlsHandle | null };
  mapStyleURL?: string;
  cameraPitch?: number;
  cameraZoomLevel?: number;
  enable3DTerrain?: boolean;
  followPlaybackCamera?: boolean;
}
