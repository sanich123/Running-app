import { useRouter } from 'expo-router';
import { Image, Pressable, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

import { useGetAllActivityPhotosByUserIdQuery } from '../../redux/runich-api/runich-api';
import ErrorComponent from '../error-component/error-component';

export default function ProfileMediaPhotos({ userId }: { userId: string }) {
  const { isLoading, data: photos, error } = useGetAllActivityPhotosByUserIdQuery(userId);
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const theme = useTheme();

  return (
    <>
      {error ? <ErrorComponent error={error} /> : null}
      {isLoading && <ActivityIndicator size="large" />}
      {photos?.length > 0 ? (
        <Pressable onPress={() => push(`/(tabs)/home/media-grid/${userId}`)}>
          <View
            style={[
              { display: 'flex', flexDirection: 'row', backgroundColor: theme.colors.onPrimary },
              isLoading && { alignItems: 'center', justifyContent: 'center' },
            ]}>
            {photos
              ?.map(({ photoUrls }) => photoUrls)
              .flat()
              .slice(0, 4)
              .map((url, index) =>
                index === 3 ? (
                  <View style={{ position: 'relative' }} key={`${url}+${index}`}>
                    <Image source={{ uri: url }} height={width / 4} width={width / 4} />
                    <Text
                      variant="bodyLarge"
                      style={{ position: 'absolute', color: theme.colors.onPrimary, top: '35%', left: '20%' }}>
                      All media
                    </Text>
                  </View>
                ) : (
                  <Image key={`${url}+${index}`} source={{ uri: url }} height={width / 4} width={width / 4} />
                ),
              )}
          </View>
        </Pressable>
      ) : null}
    </>
  );
}
