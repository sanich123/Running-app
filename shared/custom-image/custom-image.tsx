import { Image } from 'expo-image';
import { Platform } from 'react-native';
import type { ImageContentFit } from 'expo-image';

export default function CustomImage({
  style,
  source,
  contentFit,
  testID,
  placeholder,
}: {
  style: any;
  source: { uri: string | null | undefined };
  contentFit?: ImageContentFit;
  testID?: string;
  placeholder?: string | null;
}) {
  if (Platform.OS !== 'web') {
    return (
      <Image
        style={style}
        source={{ uri: source.uri || '' }}
        contentFit={contentFit}
        testID={testID}
        placeholder={placeholder}
        transition={500}
      />
    );
  }
  return <Image style={style} source={{ uri: source.uri || '' }} contentFit={contentFit} />;
}
