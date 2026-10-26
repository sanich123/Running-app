import type { DisplayedMediaItem } from '../types';

export interface ActivityMediaItemProps {
  item: DisplayedMediaItem;
  index: number;
  selectedMediaId: string | null;
  onToggleDelete: (mediaId: string) => void;
  onDeleteSuccess: () => void;
}
