import { ImageContentFit, Image } from 'expo-image';
import { Platform } from 'react-native';

export function CustomImage({
  style,
  source,
  contentFit,
  testID,
  placeholder,
}: {
  style: any;
  source: { uri: string };
  contentFit?: ImageContentFit;
  testID?: string;
  placeholder?: string;
}) {
  if (Platform.OS !== 'web') {
    return (
      <Image
        style={style}
        source={source}
        contentFit={contentFit}
        testID={testID}
        placeholder={placeholder}
        // transition={500}
      />
    );
  }
  return <Image style={style} source={source} contentFit={contentFit} />;
}
