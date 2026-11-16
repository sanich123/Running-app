import type { ImageProps, ImageContentFit } from 'expo-image';
export type CacheStatus = 'checking' | 'cached' | 'uncached';

export interface CustomImageProps {
  style?: ImageProps['style'];
  source: { uri: string | null | undefined };
  contentFit?: ImageContentFit;
  testID?: string;
  placeholder?: string | null;
  placeholderContentFit?: ImageContentFit;
  priority?: ImageProps['priority'];
  cachePolicy?: ImageProps['cachePolicy'];
  recyclingKey?: string | null;
  transition?: ImageProps['transition'];
  blurRadius?: ImageProps['blurRadius'];
  onLoad?: ImageProps['onLoad'];
  onError?: () => void;
}
