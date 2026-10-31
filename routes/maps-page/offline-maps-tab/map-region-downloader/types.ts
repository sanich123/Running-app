import type { MapsPageCopy, OfflineBounds } from '../../const';

export interface MapRegionDownloaderProps {
  centerCoordinate: [number, number];
  copy: MapsPageCopy;
  onDownloaded?: () => Promise<void>;
  onClose?: () => void;
  embedded?: boolean;
  initialVisibleBounds?: OfflineBounds | null;
}

export interface OfflineDownloadProgress {
  completedResourceCount?: number;
  erroredResourceCount?: number;
  requiredResourceCount?: number;
  loadedResourceCount?: number;
}
