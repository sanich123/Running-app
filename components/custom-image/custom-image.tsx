import { ImageContentFit, Image } from 'expo-image';
import { Platform } from 'react-native';

export function CustomImage({
  style,
  source,
  contentFit,
  testID,
}: {
  style: any;
  source: { uri: string };
  contentFit?: ImageContentFit;
  testID?: string;
}) {
  if (Platform.OS !== 'web') {
    return <Image style={style} source={source} contentFit={contentFit} testID={testID} />;
  }
  return <Image style={style} source={source} contentFit={contentFit} />;
}
