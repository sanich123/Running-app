import { CustomImage } from '@C/custom-image/custom-image';
import { useLocalSearchParams } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';

export default function PhotoViewer() {
  const { photoUrl } = useLocalSearchParams();
  const { height, width } = useWindowDimensions();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <CustomImage
        source={{ uri: decodeURIComponent(photoUrl.toString()) }}
        style={{ width, height: height - 50 }}
        contentFit="contain"
      />
    </View>
  );
}
