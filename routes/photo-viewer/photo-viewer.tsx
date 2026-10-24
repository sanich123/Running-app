import { useEffect, useState } from 'react';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';
import { View, Platform, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import {
  useGetActivityByActivityIdQuery,
  useGetAllActivityMediaByUserIdInfiniteQuery,
} from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import VideoViewer from '@Routes/photo-viewer/video-viewer/video-viewer';
import CustomImage from '@S/custom-image/custom-image';
import MediaModerationPlaceholder from '@S/media-moderation-placeholder/media-moderation-placeholder';
import { getPhotoUrl, isDirectMediaUrl, isVideoUrl } from './utils';
import type { ActivityMediaItemResponse } from '@R/runich-api/types';
import type { PageScrollStateChangedNativeEvent, PagerViewOnPageSelectedEvent } from 'react-native-pager-view';

export default function PhotoViewer() {
  const { photoUrl, indexOfPhoto, userId, take, blurhash } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webPhotoUrl = getPhotoUrl(photoUrl);
  const isDirectMedia = isDirectMediaUrl(webPhotoUrl);
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId: ownerId } = useAppSelector(({ auth }) => auth);
  const { data: activity } = useGetActivityByActivityIdQuery(
    { activityId: `${photoUrl}`, viewerId: ownerId ?? '' },
    {
      skip: !photoUrl || !uuid.validate(`${photoUrl}`) || !ownerId,
    },
  );
  const {
    data: photoPages,
    fetchNextPage,
    isFetching,
  } = useGetAllActivityMediaByUserIdInfiniteQuery(
    {
      userId: userId ? `${userId}` : ownerId,
      take: Number(take),
    },
    { skip: !take },
  );
  const userMedia = photoPages?.pages.flatMap(({ media }) => media) ?? [];
  const isActivityMedia = uuid.validate(`${photoUrl}`);
  const itemsToRender = (isActivityMedia ? (activity?.media ?? []) : userMedia).filter(
    (item) => item.mediaReviewStatus !== 'rejected',
  );
  const targetIndex = Number(photoUrl);
  const hasMorePhotos = photoPages?.pages.at(-1)?.hasMore ?? false;
  const canRenderPager = isActivityMedia
    ? itemsToRender.length > 0
    : Number.isSafeInteger(targetIndex) && targetIndex >= 0 && targetIndex < itemsToRender.length;

  useEffect(() => {
    if (
      Platform.OS !== 'web' &&
      !isActivityMedia &&
      Number.isSafeInteger(targetIndex) &&
      targetIndex >= itemsToRender.length &&
      hasMorePhotos &&
      !isFetching
    ) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasMorePhotos, isActivityMedia, isFetching, itemsToRender.length, photoUrl, targetIndex]);

  const isMapUrlExist = activity?.mapPhotoUrl ? +`${indexOfPhoto}` - 1 : +`${indexOfPhoto}`;
  const requestedInitialPage = isActivityMedia ? isMapUrlExist : targetIndex;
  const initialPage =
    Number.isSafeInteger(requestedInitialPage) && requestedInitialPage >= 0 ? requestedInitialPage : 0;
  const mediaKey = `${photoUrl}:${indexOfPhoto ?? ''}:${userId ?? ''}`;
  const [pageSelection, setPageSelection] = useState<{ mediaKey: string; index: number } | null>(null);
  const [isPagerMoving, setIsPagerMoving] = useState(false);
  const [isLandscapeByUrl, setIsLandscapeByUrl] = useState<Record<string, boolean>>({});
  const selectedPage = pageSelection?.mediaKey === mediaKey ? pageSelection.index : initialPage;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {Platform.OS === 'web' || isDirectMedia ? (
        <>
          {isVideoUrl(webPhotoUrl) ? (
            <VideoViewer url={webPhotoUrl} />
          ) : (
            <CustomImage
              source={{ uri: webPhotoUrl }}
              style={[styles.webImage, { backgroundColor: colors.background }]}
              contentFit="contain"
              placeholder={typeof blurhash === 'string' ? blurhash : undefined}
            />
          )}
        </>
      ) : (
        <>
          {canRenderPager && (
            <PagerView
              style={styles.viewPager}
              initialPage={initialPage}
              onPageSelected={(event: PagerViewOnPageSelectedEvent) => {
                setPageSelection({ mediaKey, index: event.nativeEvent.position });
                if (!isActivityMedia && event.nativeEvent.position >= itemsToRender.length - 2 && hasMorePhotos) {
                  void fetchNextPage();
                }
              }}
              onPageScrollStateChanged={(event: PageScrollStateChangedNativeEvent) =>
                setIsPagerMoving(event.nativeEvent.pageScrollState !== 'idle')
              }
              orientation="vertical">
              {itemsToRender.map(({ url, blurhash, mediaReviewStatus }: ActivityMediaItemResponse, index: number) => (
                <View key={index} style={[styles.page, { backgroundColor: colors.background }]}>
                  {!url ? (
                    <MediaModerationPlaceholder status={mediaReviewStatus} blurhash={blurhash} />
                  ) : isVideoUrl(url) ? (
                    <VideoViewer url={url} isActive={!isPagerMoving && selectedPage === index} />
                  ) : (
                    <CustomImage
                      source={{ uri: url }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit={isLandscapeByUrl[url] === false ? 'cover' : 'contain'}
                      placeholder={blurhash}
                      onLoad={(event) => {
                        const { width, height } = event.source;
                        if (width > 0 && height > 0) {
                          setIsLandscapeByUrl((current) => ({ ...current, [url]: width > height }));
                        }
                      }}
                    />
                  )}
                  {url && mediaReviewStatus && mediaReviewStatus !== 'approved' && mediaReviewStatus !== 'rejected' ? (
                    <MediaModerationPlaceholder status={mediaReviewStatus} compact overlay />
                  ) : null}
                </View>
              ))}
            </PagerView>
          )}
        </>
      )}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <Pressable
          testID="photo-viewer-back"
          accessibilityRole="button"
          accessibilityLabel={language === LANGUAGES.russian ? 'Назад' : 'Back'}
          onPress={() => router.back()}
          hitSlop={8}
          style={[styles.backButton, { top: Math.max(insets.top, 8) + 8 }]}>
          <Icon source="arrow-left" size={30} color="#fff" />
        </Pressable>
      </View>
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
  backButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    left: 12,
    position: 'absolute',
    width: 48,
    zIndex: 10,
  },
  page: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
