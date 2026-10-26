import type { ImageProps } from 'expo-image';

export interface MediaThumbnailProps {
  mediaUrl: string;
  thumbnail?: string | null;
  isVideo?: boolean;
  style?: ImageProps['style'];
  testID?: string;
  placeholder?: string | null;
  recyclingKey?: string | null;
  onLoad?: ImageProps['onLoad'];
}
