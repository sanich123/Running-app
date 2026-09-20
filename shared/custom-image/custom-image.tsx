import { Image } from 'expo-image';
import { Platform } from 'react-native';
import type { ImageContentFit, ImageProps } from 'expo-image';

export default function CustomImage({
  style,
  source,
  contentFit,
  testID,
  placeholder,
  placeholderContentFit,
  priority,
  cachePolicy,
  recyclingKey,
  transition,
  onLoad,
  onError,
}: {
  style: any;
  source: { uri: string | null | undefined };
  contentFit?: ImageContentFit;
  testID?: string;
  placeholder?: string | null;
  placeholderContentFit?: ImageContentFit;
  priority?: ImageProps['priority'];
  cachePolicy?: ImageProps['cachePolicy'];
  recyclingKey?: string | null;
  transition?: ImageProps['transition'];
  onLoad?: () => void;
  onError?: () => void;
}) {
  const resolvedTransition = transition ?? { duration: 650, timing: 'ease-out' as const };

  return (
    <Image
      style={style}
      source={{ uri: source.uri || '' }}
      contentFit={contentFit}
      testID={Platform.OS !== 'web' ? testID : undefined}
      placeholder={placeholder}
      placeholderContentFit={placeholderContentFit ?? contentFit}
      priority={priority}
      cachePolicy={cachePolicy}
      recyclingKey={Platform.OS !== 'web' ? recyclingKey : undefined}
      transition={resolvedTransition}
      onLoad={onLoad}
      onError={onError}
    />
  );
}
