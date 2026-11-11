import type { MapsPageCopy } from '../const';

export interface MapSearchPanelProps {
  visible: boolean;
  copy: MapsPageCopy;
  onDismiss: () => void;
  onSelectLocation: (coordinate: [number, number]) => void;
}
