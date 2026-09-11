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
}) {
  return (
    <Image
      style={style}
      source={{ uri: source.uri || '' }}
      contentFit={contentFit}
      testID={Platform.OS !== 'web' ? testID : undefined}
      placeholder={placeholder}
      placeholderContentFit={placeholderContentFit}
      priority={priority}
      cachePolicy={cachePolicy}
      recyclingKey={Platform.OS !== 'web' ? recyclingKey : undefined}
      transition={transition ?? (Platform.OS !== 'web' ? 500 : undefined)}
    />
  );
}
