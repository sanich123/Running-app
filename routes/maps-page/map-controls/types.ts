export interface MapControlsProps {
  copy: {
    satellite: string;
    street: string;
    switchTo2d: string;
    switchTo3d: string;
    locate: string;
    search: string;
    zoomIn: string;
    zoomOut: string;
  };
  isSatellite: boolean;
  is3d: boolean;
  onToggleMapStyle: () => void;
  onTogglePitch: () => void;
  onLocate: () => void;
  onSearch: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}
