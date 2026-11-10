import type { MapsPageCopy, OfflineBounds } from '../../const';

export interface MapRegionDownloaderProps {
  centerCoordinate: [number, number];
  copy: MapsPageCopy;
  onDownloaded?: () => Promise<void>;
  onClose?: () => void;
  embedded?: boolean;
  initialVisibleBounds?: OfflineBounds | null;
  initialIsSatellite?: boolean;
  previewOnly?: boolean;
  previewTitle?: string;
}

export interface OfflineDownloadProgress {
  completedResourceCount?: number;
  erroredResourceCount?: number;
  requiredResourceCount?: number;
  loadedResourceCount?: number;
}
