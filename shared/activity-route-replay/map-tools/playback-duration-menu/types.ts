import type { MapToolsProps, ReplayDuration } from '../../types';

export interface PlaybackDurationMenuProps {
  playbackDuration: ReplayDuration;
  copy: MapToolsProps['copy'];
  isDisabled: boolean;
  onSelect: (duration: ReplayDuration) => void;
}
