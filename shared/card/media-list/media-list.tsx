import { useCallback, useMemo, useState } from 'react';
import { FlatList, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableRipple, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { LANGUAGES, ROUTES } from '@const/enums';
import { createSearchParams } from '@R/runich-api/create-search-params';
import { activityApi, useDeleteActivityMediaMutation } from '@R/services/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { isVideoUrl } from '@Routes/photo-viewer/utils';
import ActivityMediaDeleteBtn from '@S/activity-media/delete-btn';
import AddActivityMediaBtn from '@S/card/add-media-btn/add-media-btn';
import CustomImage from '@S/custom-image/custom-image';
import { errorToast } from '@S/error-toast/error-toast';
import useLongPressGuard from '@S/pressable/use-long-press-guard';
import { useActivityCard } from '../context';
import {
  ACTIVITY_MEDIA_ASPECT_RATIO,
  ACTIVITY_MEDIA_HEIGHT_RATIO,
  ACTIVITY_MEDIA_MAX_HEIGHT,
  ACTIVITY_MEDIA_MIN_HEIGHT,
} from './const';
import VideoMedia from './video-media';
import MapMetaOverlay from '../map-meta-overlay/map-meta-overlay';
import RouteReplayBtn from '../route-replay-btn/route-replay-btn';
import type { ActivityMediaItem } from '../types';

const MEDIA_VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 60 };

interface DisplayedMediaItem extends ActivityMediaItem {
  isMap?: boolean;
}

interface MediaViewToken {
  index: number | undefined;
}

export default function MediaList() {
  const { activity } = useActivityCard();
  const {
    media,
    mapPhotoUrl,
    userId: activityOwnerId,
    id,
    mapPhotoUrlBlurhash,
    locationName,
    weatherTemperature,
    weatherWindSpeed,
    weatherCode,
    emotion,
    profile,
  } = activity;
  const [isMapPressed, setIsMapPressed] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const longPressGuard = useLongPressGuard();
  const { dark } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const [deleteActivityMedia, { isLoading: isDeletingMedia }] = useDeleteActivityMediaMutation();
  const mediaWidth = width < MAX_MOBILE_WIDTH ? Math.max(width, 0) : MAX_MOBILE_WIDTH;
  const mediaHeight = Math.min(
    Math.max(mediaWidth * ACTIVITY_MEDIA_HEIGHT_RATIO, ACTIVITY_MEDIA_MIN_HEIGHT),
    ACTIVITY_MEDIA_MAX_HEIGHT,
  );
  const isOwnActivity = Boolean(activityOwnerId && activityOwnerId === currentUserId);
  const canViewReplay = activity.profile?.allowActivityReplayViewing !== false || isOwnActivity;
  const [mediaAspectRatios, setMediaAspectRatios] = useState<Record<string, number>>({});
  const [visibleMediaIndices, setVisibleMediaIndices] = useState<Set<number>>(() => new Set([0]));
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: MediaViewToken[]; changed: MediaViewToken[] }) => {
      setVisibleMediaIndices(
        new Set(viewableItems.map(({ index }) => index).filter((index): index is number => index != null)),
      );
    },
    [],
  );

  const handleDeleteMedia = useCallback(
    async (mediaId: string) => {
      try {
        await deleteActivityMedia({ activityId: id, mediaId }).unwrap();
        setSelectedMediaId(null);
      } catch (error) {
        errorToast('', error);
      }
    },
    [deleteActivityMedia, id],
  );

  const displayedData = useMemo(() => {
    const activityMedia: DisplayedMediaItem[] = (media ?? []).map((item) => ({ ...item, isMap: false }));
    return mapPhotoUrl
      ? [{ url: mapPhotoUrl, thumbnail: null, blurhash: mapPhotoUrlBlurhash, isMap: true }, ...activityMedia]
      : activityMedia;
  }, [mapPhotoUrl, mapPhotoUrlBlurhash, media]);
  const getMediaWidth = useCallback(
    (item: DisplayedMediaItem) => {
      const aspectRatio = item.isMap ? ACTIVITY_MEDIA_ASPECT_RATIO : (mediaAspectRatios[item.url] ?? 1);
      const minimumWidth = mediaHeight * 0.56;
      return Math.min(mediaWidth, Math.max(mediaHeight * aspectRatio, minimumWidth));
    },
    [mediaAspectRatios, mediaHeight, mediaWidth],
  );
  const renderItem = useCallback(
    ({ item, index }: { item: (typeof displayedData)[number]; index: number }) => {
      const isMap = item.isMap === true;
      const isVideo = !isMap && isVideoUrl(item.url);
      const itemWidth = getMediaWidth(item);
      const isActive = visibleMediaIndices.has(index);
      const onMediaMetadata = (metadata: { aspectRatio?: number }) => {
        if (!metadata.aspectRatio || !Number.isFinite(metadata.aspectRatio)) return;
        setMediaAspectRatios((current) =>
          current[item.url] === metadata.aspectRatio ? current : { ...current, [item.url]: metadata.aspectRatio! },
        );
      };
      return (
        <View
          testID={isMap ? 'activity-map-media-container' : undefined}
          style={[styles.mediaTile, { height: mediaHeight, width: itemWidth }]}>
          <TouchableRipple
            testID={isMap ? 'activity-map-media-item' : `activity-media-${item.id ?? index}`}
            onPressIn={() => {
              longPressGuard.resetForGesture();
              if (isMap) setIsMapPressed(true);
            }}
            onPressOut={() => {
              if (isMap) setIsMapPressed(false);
            }}
            onLongPress={
              !isMap && isOwnActivity && item.id
                ? () => {
                    longPressGuard.markLongPress();
                    setSelectedMediaId((selectedId) => (selectedId === item.id ? null : (item.id ?? null)));
                  }
                : undefined
            }
            onPress={() => {
              if (!longPressGuard.shouldHandlePress()) return;
              if (isMap && profile?.allowActivityReplayViewing === false) {
                return errorToast('Пользователь запретил просматривать информацию о своем маршруте');
              }
              if (isMap) {
                void dispatch(
                  activityApi.util.prefetch('getLocationsByActivityId', { activityId: id }, { ifOlderThan: 60 }),
                );
              }
              push(
                isMap
                  ? `/${ROUTES.map}/${id}`
                  : `/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(item.url) : id}${createSearchParams({
                      indexOfPhoto: index,
                      blurhash: item.blurhash,
                    })}`,
              );
            }}
            borderless={false}
            accessibilityRole="button"
            accessibilityLabel={
              isMap
                ? language === LANGUAGES.russian
                  ? 'Открыть карту тренировки'
                  : 'Open activity map'
                : language === LANGUAGES.russian
                  ? 'Открыть медиа тренировки'
                  : 'Open activity media'
            }>
            {isVideo ? (
              <VideoMedia
                url={item.url}
                width={itemWidth}
                height={mediaHeight}
                isActive={isActive}
                playLabel={language === LANGUAGES.russian ? 'Воспроизвести видео' : 'Play video'}
                pauseLabel={language === LANGUAGES.russian ? 'Приостановить видео' : 'Pause video'}
                muteLabel={language === LANGUAGES.russian ? 'Выключить звук видео' : 'Mute video'}
                unmuteLabel={language === LANGUAGES.russian ? 'Включить звук видео' : 'Unmute video'}
                testID={`activity-video-${item.id ?? index}`}
                onMetadata={onMediaMetadata}
              />
            ) : (
              <CustomImage
                style={{ width: itemWidth, height: mediaHeight }}
                source={{ uri: item.thumbnail ? item.thumbnail : item.url }}
                contentFit="cover"
                placeholderContentFit="cover"
                priority={index === 0 ? 'high' : 'normal'}
                cachePolicy="memory-disk"
                recyclingKey={item.url}
                testID={item.url}
                placeholder={item?.blurhash}
                onLoad={(event) => {
                  const { width: loadedWidth, height: loadedHeight } = event.source;
                  if (loadedWidth > 0 && loadedHeight > 0) {
                    onMediaMetadata({ aspectRatio: loadedWidth / loadedHeight });
                  }
                }}
              />
            )}
          </TouchableRipple>
          {!isMap && isOwnActivity && item.id && selectedMediaId === item.id ? (
            <View style={styles.deleteButton}>
              <ActivityMediaDeleteBtn onDelete={() => void handleDeleteMedia(item.id!)} isDeleting={isDeletingMedia} />
            </View>
          ) : null}
          {isMap ? (
            <>
              {isMapPressed ? (
                <View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    styles.mapPressOverlay,
                    { backgroundColor: dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' },
                  ]}
                  testID="activity-map-press-overlay"
                />
              ) : null}
              <MapMetaOverlay
                locationName={locationName}
                weatherTemperature={weatherTemperature}
                weatherWindSpeed={weatherWindSpeed}
                weatherCode={weatherCode}
                emotion={emotion}
              />
              <View pointerEvents="box-none" style={styles.mapActions}>
                {isOwnActivity ? <AddActivityMediaBtn activityId={id} media={media ?? []} /> : null}
                {canViewReplay ? <RouteReplayBtn activityId={id} userId={activityOwnerId} /> : null}
              </View>
            </>
          ) : null}
        </View>
      );
    },
    [
      getMediaWidth,
      mediaHeight,
      isOwnActivity,
      selectedMediaId,
      language,
      isDeletingMedia,
      isMapPressed,
      dark,
      dispatch,
      locationName,
      weatherTemperature,
      weatherWindSpeed,
      weatherCode,
      emotion,
      id,
      media,
      canViewReplay,
      activityOwnerId,
      longPressGuard,
      profile?.allowActivityReplayViewing,
      push,
      handleDeleteMedia,
      setMediaAspectRatios,
      visibleMediaIndices,
    ],
  );

  return (
    <FlatList
      data={displayedData}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      testID="activity-media-list"
      contentContainerStyle={styles.listContent}
      initialNumToRender={Math.max(1, Math.min(displayedData.length, 3))}
      maxToRenderPerBatch={3}
      windowSize={5}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews={false}
      ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      viewabilityConfig={MEDIA_VIEWABILITY_CONFIG}
      onViewableItemsChanged={onViewableItemsChanged}
      keyExtractor={(item) => item.url}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingVertical: 12 },
  itemSeparator: { width: 8 },
  mediaTile: {
    borderCurve: 'continuous',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 4,
  },
  mapActions: {
    alignItems: 'center',
    bottom: 8,
    flexDirection: 'row',
    gap: 4,
    position: 'absolute',
    right: 8,
    zIndex: 3,
  },
  mapPressOverlay: {
    zIndex: 1,
  },
});
