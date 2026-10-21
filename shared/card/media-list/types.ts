import type { ActivityMediaItem } from '../types';
export interface VideoMetadata {
  duration?: number;
  aspectRatio?: number;
}

export interface VideoMediaProps {
  url: string;
  thumbnail: string | null;
  blurhash?: string | null;
  width: number;
  height: number;
  playLabel: string;
  pauseLabel: string;
  muteLabel: string;
  unmuteLabel: string;
  testID: string;
  onMetadata?: (metadata: VideoMetadata) => void;
}

export interface ActiveVideoPlayerProps {
  url: string;
  isMuted: boolean;
  isPaused: boolean;
  onMetadata?: (metadata: VideoMetadata) => void;
}

export interface DisplayedMediaItem extends ActivityMediaItem {
  isMap?: boolean;
}
