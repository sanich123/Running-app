import { CustomImage } from '@C/custom-image/custom-image';
import { useGetAllActivityPhotosByUserIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { PROFILE_MEDIA } from './const';

export default function ProfileMediaPhotos({ userId }: { userId: string }) {
  const { isLoading, isError, data: photos, error } = useGetAllActivityPhotosByUserIdQuery(userId);
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const theme = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;

  return (
    <>
      <Pressable
        onPress={() => push(`/${place}/${ROUTES.mediaGrid}/${userId}`)}
        disabled={isError || isLoading}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
        <View
          style={[
            styles.layout,
            { backgroundColor: theme.colors.onPrimary },
            (isLoading || isError) && styles.isInCenter,
          ]}>
          {isError && <Text variant="bodyLarge">{`${PROFILE_MEDIA[language].error}: ${errorExtracter(error)}`}</Text>}
          {!isError &&
            photos?.length > 0 &&
            photos
              ?.map(
                ({ photoVideoUrls }: { photoVideoUrls: { url: string; thumbnail: string | null } }) => photoVideoUrls,
              )
              .flat()
              .slice(0, 4)
              .map(({ url, thumbnail }: { url: string; thumbnail: string | null }, index: number) => {
                if (index === 3) {
                  return (
                    <Fragment key={`${url}+${index}`}>
                      <View style={{ position: 'relative', opacity: 0.2, backgroundColor: 'grey' }}>
                        <CustomImage
                          style={{ width: width / 4, height: width / 4 }}
                          source={{ uri: thumbnail || url }}
                        />
                      </View>
                      <Text variant="titleMedium" style={{ position: 'absolute', top: '35%', right: 12, zIndex: 10 }}>
                        {PROFILE_MEDIA[language].label}
                      </Text>
                    </Fragment>
                  );
                }
                return (
                  <CustomImage
                    key={`${url}+${index}`}
                    source={{ uri: thumbnail || url }}
                    style={{ width: width / 4, height: width / 4 }}
                    contentFit="cover"
                  />
                );
              })}
        </View>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    flexDirection: 'row',
  },
  isInCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
