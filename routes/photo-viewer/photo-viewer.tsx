import { useEffect } from 'react';
import PagerView from 'react-native-pager-view';
import uuid from 'react-native-uuid';
import { View, Platform, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from 'react-native-paper';
import {
  useGetActivityByActivityIdQuery,
  useGetAllActivityPhotosByUserIdInfiniteQuery,
} from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import VideoViewer from '@Routes/photo-viewer/video-viewer/video-viewer';
import CustomImage from '@S/custom-image/custom-image';
import { getPhotoUrl, isVideoUrl } from './utils';
import type { ActivityPhotoResponse } from '@R/runich-api/types';

export default function PhotoViewer() {
  const { photoUrl, indexOfPhoto, userId, take } = useLocalSearchParams();
  const webPhotoUrl = getPhotoUrl(photoUrl);
  const { colors } = useTheme();
  const { userId: ownerId } = useAppSelector(({ auth }) => auth);
  const { data: activity } = useGetActivityByActivityIdQuery(`${photoUrl}`, {
    skip: !photoUrl || !uuid.validate(`${photoUrl}`),
  });
  const {
    data: photoPages,
    fetchNextPage,
    isFetching,
  } = useGetAllActivityPhotosByUserIdInfiniteQuery(
    {
      userId: userId ? `${userId}` : ownerId,
      take: Number(take),
    },
    { skip: !take },
  );
  const userPhotos = photoPages?.pages.flatMap(({ photos }) => photos) ?? [];
  const itemsToRender = uuid.validate(`${photoUrl}`) ? (activity?.photoVideoUrls ?? []) : userPhotos;
  const targetIndex = Number(photoUrl);
  const hasMorePhotos = photoPages?.pages.at(-1)?.hasMore ?? false;
  const canRenderPager = uuid.validate(`${photoUrl}`)
    ? itemsToRender.length > 0
    : Number.isSafeInteger(targetIndex) && targetIndex >= 0 && targetIndex < itemsToRender.length;

  useEffect(() => {
    if (
      Platform.OS !== 'web' &&
      !uuid.validate(`${photoUrl}`) &&
      Number.isSafeInteger(targetIndex) &&
      targetIndex >= itemsToRender.length &&
      hasMorePhotos &&
      !isFetching
    ) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasMorePhotos, isFetching, itemsToRender.length, photoUrl, targetIndex]);

  const isMapUrlExist = activity?.mapPhotoUrl ? +`${indexOfPhoto}` - 1 : +`${indexOfPhoto}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {Platform.OS === 'web' ? (
        <>
          {isVideoUrl(webPhotoUrl) ? (
            <VideoViewer url={webPhotoUrl} />
          ) : (
            <CustomImage
              source={{ uri: webPhotoUrl }}
              style={[styles.webImage, { backgroundColor: colors.background }]}
              contentFit="contain"
            />
          )}
        </>
      ) : (
        <>
          {canRenderPager && (
            <PagerView
              style={styles.viewPager}
              initialPage={uuid.validate(`${photoUrl}`) ? isMapUrlExist : +`${photoUrl}`}
              onPageSelected={(event) => {
                if (
                  !uuid.validate(`${photoUrl}`) &&
                  event.nativeEvent.position >= itemsToRender.length - 2 &&
                  hasMorePhotos
                ) {
                  void fetchNextPage();
                }
              }}
              orientation="vertical">
              {itemsToRender.map(({ url, blurhash }: ActivityPhotoResponse, index: number) => (
                <View key={index}>
                  {['mp4', 'avi', 'm4v'].includes(url) ? (
                    <VideoViewer url={url} />
                  ) : (
                    <CustomImage
                      source={{ uri: url }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      placeholder={blurhash}
                    />
                  )}
                </View>
              ))}
            </PagerView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  webImage: {
    alignSelf: 'stretch',
    flex: 1,
    width: '100%',
  },
  viewPager: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
