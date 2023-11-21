import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View, useWindowDimensions, Image, StyleSheet } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

import ErrorComponent from '../../../../components/error-component/error-component';
import { useGetAllActivityPhotosByUserIdQuery } from '../../../../redux/runich-api/runich-api';

export default function MediaGrid() {
  const { id: userId } = useLocalSearchParams();
  const { isLoading, data: photos, error, isError, isSuccess } = useGetAllActivityPhotosByUserIdQuery(`${userId}`);
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const theme = useTheme();
  const gap = 3;
  const calculatedWidth = (width - gap * 3) / 4;

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.background,
          gap,
        },
        styles.layout,
        (isLoading || isError) && styles.isInCenter,
      ]}>
      {isLoading && <ActivityIndicator size="large" />}
      {isError ? <ErrorComponent error={error} /> : null}
      {isSuccess &&
        !isError &&
        photos
          ?.map(({ photoUrls }) => photoUrls)
          .flat()
          .map((url, index) => (
            <Pressable key={`${url}+${index}`} onPress={() => push(`/home/media/${encodeURIComponent(url)}`)}>
              <Image key={`${url}+${index}`} source={{ uri: url }} height={calculatedWidth} width={calculatedWidth} />
            </Pressable>
          ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  isInCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
