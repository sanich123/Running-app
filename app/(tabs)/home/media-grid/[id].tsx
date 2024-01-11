import ErrorComponent from '@C/error-component/error-component';
import { useGetAllActivityPhotosByUserIdQuery } from '@R/runich-api/runich-api';
import { ROUTES } from '@const/enums';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, useWindowDimensions, Image, StyleSheet, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

export default function MediaGrid() {
  const { id: userId } = useLocalSearchParams();
  const { isLoading, data: photos, error, isError, isSuccess } = useGetAllActivityPhotosByUserIdQuery(`${userId}`);
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const theme = useTheme();
  const gap = 3;
  const calculatedWidth = (width - gap * 3) / 4;

  return (
    <ScrollView>
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
            ?.map(({ photoUrls }: { photoUrls: string[] }) => photoUrls)
            .flat()
            .map((url: string, index: number) => (
              <Pressable
                key={`${url}+${index}`}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                onPress={() => push(`/${ROUTES.home}/${ROUTES.media}/${encodeURIComponent(url)}`)}>
                <Image key={`${url}+${index}`} source={{ uri: url }} height={calculatedWidth} width={calculatedWidth} />
              </Pressable>
            ))}
      </View>
    </ScrollView>
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
