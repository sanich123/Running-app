import { useRouter } from 'expo-router';
import { Image, Pressable, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { useGetAllActivityPhotosByUserIdQuery } from '../../redux/runnich-api/runnich-api';
import ErrorComponent from '../error-component/error-component';

export default function ProfileMediaPhotos({ userId }: { userId: string }) {
  const { isLoading, data: photos, error } = useGetAllActivityPhotosByUserIdQuery(userId);
  const { width } = useWindowDimensions();
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(`/(tabs)/home/media-grid/${userId}`)}>
      <View
        style={[
          { display: 'flex', flexDirection: 'row', backgroundColor: 'white' },
          isLoading && { alignItems: 'center', justifyContent: 'center' },
        ]}>
        {isLoading && <ActivityIndicator size="large" />}
        {error ? <ErrorComponent error={error} /> : null}
        {photos
          ?.slice(0, 4)
          .map(({ photoUrl }) => (
            <Image key={photoUrl} source={{ uri: photoUrl }} height={width / 4} width={width / 4} />
          ))}
      </View>
    </Pressable>
  );
}
