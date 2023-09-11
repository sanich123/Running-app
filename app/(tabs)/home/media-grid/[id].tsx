import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View, useWindowDimensions, Image } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

import ErrorComponent from '../../../../components/error-component/error-component';
import { useGetAllActivityPhotosByUserIdQuery } from '../../../../redux/runnich-api/runnich-api';

export default function MediaGrid() {
  const { id: userId } = useLocalSearchParams();
  const { isLoading, data: photos, error } = useGetAllActivityPhotosByUserIdQuery(userId.toString());
  const { width } = useWindowDimensions();
  const router = useRouter();
  const theme = useTheme();
  const gap = 3;
  const calculatedWidth = (width - gap * 3) / 4;
  return (
    <View
      style={[
        {
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: theme.colors.background,
          flexWrap: 'wrap',
          gap,
        },
        isLoading && { alignItems: 'center', justifyContent: 'center' },
      ]}>
      {isLoading && <ActivityIndicator size="large" />}
      {error ? <ErrorComponent error={error} /> : null}
      {photos?.map(({ photoUrl }) => (
        <Pressable key={photoUrl} onPress={() => router.push(`/home/media/${encodeURIComponent(photoUrl)}`)}>
          <Image key={photoUrl} source={{ uri: photoUrl }} height={calculatedWidth} width={calculatedWidth} />
        </Pressable>
      ))}
    </View>
  );
}
