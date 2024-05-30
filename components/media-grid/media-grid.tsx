import { PhotoVideoType } from '@C/card/const ';
import { CustomImage } from '@C/custom-image/custom-image';
import ErrorComponent from '@C/error-component/error-component';
import { useGetAllActivityPhotosByUserIdQuery } from '@R/runich-api/runich-api';
import { ROUTES } from '@const/enums';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { ScrollView, useWindowDimensions, StyleSheet, View, Platform } from 'react-native';
import { ActivityIndicator, TouchableRipple, useTheme } from 'react-native-paper';

export default function MediaGrid() {
  const { push } = useRouter();
  const { dark, colors } = useTheme();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const { id: userId } = useLocalSearchParams();
  const { isLoading, data, error, isError, isSuccess } = useGetAllActivityPhotosByUserIdQuery(
    { userId: `${userId}`, page: 0, take: 30 },
    { skip: !userId, refetchOnMountOrArgChange: true },
  );

  const gap = 3;
  const calculatedWidth = (width - gap * 3) / 4;

  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;

  return (
    <ScrollView>
      <View
        style={[
          {
            backgroundColor: colors.background,
            gap: 3,
          },
          styles.layout,
          (isLoading || isError) && styles.isInCenter,
        ]}>
        {isLoading && <ActivityIndicator size="large" />}
        {isError ? <ErrorComponent error={error} /> : null}
        {isSuccess &&
          !isError &&
          data?.photos?.length > 0 &&
          data?.photos.map(({ url, thumbnail, blurhash }: PhotoVideoType, index: number) => (
            <TouchableRipple
              rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
              key={url}
              onPress={() =>
                push(
                  `/(tabs)/${place}/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(url) : index}?userId=${userId}`,
                )
              }
              borderless>
              <CustomImage
                style={{ height: calculatedWidth, width: calculatedWidth }}
                source={{ uri: thumbnail || url }}
                contentFit="cover"
                placeholder={blurhash}
              />
            </TouchableRipple>
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
