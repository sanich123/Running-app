import type { MapsPageCopy } from '../../const';
import type { SavedOfflineMap } from '@U/offline-map-library';

export interface OfflineMapListProps {
  maps: SavedOfflineMap[];
  copy: MapsPageCopy;
  onMapsChange: (maps: SavedOfflineMap[]) => void;
  onOpenMap?: (offlineMap: SavedOfflineMap) => void;
}
