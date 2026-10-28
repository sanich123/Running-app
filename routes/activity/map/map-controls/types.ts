export interface MapControlsProps {
  mapZoomLevel: number;
  isCenteringOnCurrentLocation: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterOnCurrentLocation: () => void;
}
