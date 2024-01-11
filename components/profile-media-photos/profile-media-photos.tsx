import { useGetAllActivityPhotosByUserIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import { ROUTES } from '@const/enums';
import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

import { PROFILE_MEDIA } from './const';

export default function ProfileMediaPhotos({ userId }: { userId: string }) {
  const { isLoading, isError, data: photos, error, isSuccess } = useGetAllActivityPhotosByUserIdQuery(userId);
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const theme = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  return (
    <>
      <Pressable
        onPress={() => push(`/${ROUTES.home}/${ROUTES.mediaGrid}/${userId}`)}
        disabled={isError || isLoading}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
        <View
          style={[
            styles.layout,
            { backgroundColor: theme.colors.onPrimary },
            (isLoading || isError) && styles.isInCenter,
          ]}>
          {isError && <Text variant="bodyLarge">{`${PROFILE_MEDIA[language].error}: ${errorExtracter(error)}`}</Text>}
          {isLoading && <ActivityIndicator size="large" />}
          {!isError &&
            isSuccess &&
            photos
              ?.map(({ photoUrls }: { photoUrls: string[] }) => photoUrls)
              .flat()
              .slice(0, 4)
              .map((url: string, index: number) =>
                index === 3 ? (
                  <Fragment key={`${url}+${index}`}>
                    <View style={{ position: 'relative', opacity: 0.2, backgroundColor: 'grey' }}>
                      <Image source={{ uri: url }} height={width / 4} width={width / 4} />
                    </View>
                    <Text variant="titleMedium" style={{ position: 'absolute', top: '35%', right: 12, zIndex: 10 }}>
                      {PROFILE_MEDIA[language].label}
                    </Text>
                  </Fragment>
                ) : (
                  <Image key={`${url}+${index}`} source={{ uri: url }} height={width / 4} width={width / 4} />
                ),
              )}
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
