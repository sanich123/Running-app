import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { View, Image, useWindowDimensions, Platform } from 'react-native';

export default function PhotoViewer() {
  const { photoUrl } = useLocalSearchParams();
  const { height, width } = useWindowDimensions();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {Platform.OS === 'web' ? (
        <ExpoImage
          source={{ uri: decodeURIComponent(photoUrl.toString()) }}
          style={{ width, height: height - 50 }}
          contentFit="contain"
        />
      ) : (
        <Image
          key={`${photoUrl}`}
          source={{ uri: decodeURIComponent(photoUrl.toString()) }}
          height={height - 50}
          width={width}
          resizeMode="contain"
        />
      )}
    </View>
  );
}
