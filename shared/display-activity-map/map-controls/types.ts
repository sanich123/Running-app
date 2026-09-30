import type { ReactNode } from 'react';

export type DisplayMapStyle = 'map' | 'satellite';

interface MapControlsCopy {
  satellite: string;
  map: string;
  zoomIn: string;
  zoomOut: string;
}

export interface MapControlsProps {
  mapStyle: DisplayMapStyle;
  copy: MapControlsCopy;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMapStyleChange: (mapStyle: DisplayMapStyle) => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  isDisabled?: boolean;
  testIdPrefix?: string;
  children?: ReactNode;
}

export interface WebMapControlsHandle {
  zoomTo: (zoomLevel: number, durationMs?: number) => void;
}
