import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';

export default function PhotoViewer() {
  const { photoUrl } = useLocalSearchParams();
  const { height, width } = useWindowDimensions();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={{ uri: decodeURIComponent(photoUrl.toString()) }}
        style={{ width, height: height - 50 }}
        contentFit="contain"
      />
    </View>
  );
}
