import ErrorComponent from '@C/error-component/error-component';
import { useGetAllActivityPhotosByUserIdQuery } from '@R/runich-api/runich-api';
import { getPhotosWithoutMaps } from '@U/get-photos-without-maps';
import { ROUTES } from '@const/enums';
import { Image } from 'expo-image';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Pressable, ScrollView, useWindowDimensions, StyleSheet, View, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ActivityIndicator, useTheme } from 'react-native-paper';

export default function MediaGrid() {
  const { id: userId } = useLocalSearchParams();
  const { isLoading, data: photos, error, isError, isSuccess } = useGetAllActivityPhotosByUserIdQuery(`${userId}`);
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const theme = useTheme();
  const gap = 3;
  const calculatedWidth = (width - gap * 3) / 4;
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
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
          photos?.length > 0 &&
          getPhotosWithoutMaps(photos).map((url: string, index: number) => (
            <Pressable
              key={`${url}+${index}`}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              onPress={() => push(`/${place}/${ROUTES.media}/${encodeURIComponent(url)}`)}>
              <>
                {Platform.OS === 'web' ? (
                  <Image
                    style={{ height: calculatedWidth, width: calculatedWidth }}
                    source={{ uri: url }}
                    contentFit="cover"
                  />
                ) : (
                  <FastImage
                    key={`${url}+${index}`}
                    source={{
                      uri: url,
                      priority: FastImage.priority.high,
                    }}
                    style={{ height: calculatedWidth, width: calculatedWidth }}
                  />
                )}
              </>
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
