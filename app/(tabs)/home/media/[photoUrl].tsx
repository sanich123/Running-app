import { useLocalSearchParams } from 'expo-router';
import { View, Image, useWindowDimensions } from 'react-native';

export default function Media() {
  const { photoUrl } = useLocalSearchParams();
  const { height, width } = useWindowDimensions();
  return (
    <View style={{ flex: 1 }}>
      <Image
        key={photoUrl.toString()}
        source={{ uri: decodeURIComponent(photoUrl.toString()) }}
        height={height - 50}
        width={width}
        resizeMode="cover"
      />
    </View>
  );
}
