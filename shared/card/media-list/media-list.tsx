import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableRipple } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { LANGUAGES, ROUTES } from '@const/enums';
import { createSearchParams } from '@R/runich-api/create-search-params';
import { activityApi, useDeleteActivityMediaMutation } from '@R/services/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { isVideoUrl } from '@Routes/photo-viewer/utils';
import ActivityMediaDeleteBtn from '@S/activity-media/activity-media-delete-btn/activity-media-delete-btn';
import AddActivityMediaBtn from '@S/card/add-media-btn/add-activity-media-btn/add-activity-media-btn';
import CustomImage from '@S/custom-image/custom-image';
import { errorToast } from '@S/error-toast/error-toast';
import MediaModerationPlaceholder from '@S/media-moderation-placeholder/media-moderation-placeholder';
import ContentActionsMenu from '@S/moderation/content-actions-menu/content-actions-menu';
import ReportContentDialog from '@S/moderation/report-content-dialog/report-content-dialog';
import { useActivityCard } from '../context';
import {
  ACTIVITY_MEDIA_ASPECT_RATIO,
  ACTIVITY_MEDIA_HEIGHT_RATIO,
  ACTIVITY_MEDIA_MAX_HEIGHT,
  ACTIVITY_MEDIA_MIN_HEIGHT,
} from './const';
import VideoMedia from './video-media/video-media';
import FavoriteActivityBtn from '../favorite-activity-btn/favorite-activity-btn';
import MapMetaOverlay from '../map-meta-overlay/map-meta-overlay';
import RouteReplayBtn from '../route-replay-btn/route-replay-btn';
import type { DisplayedMediaItem } from './types';

export default function MediaList() {
  const { activity, isFullView } = useActivityCard();
  const {
    media,
    mapPhotoUrl,
    routeOnlyMapPhotoUrl,
    hideMap,
    userId: activityOwnerId,
    id,
    mapPhotoUrlBlurhash,
    isFavorite,
    locationName,
    weatherTemperature,
    weatherWindSpeed,
    weatherCode,
    emotion,
    profile,
  } = activity;
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [reportedMediaId, setReportedMediaId] = useState<string | null>(null);
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const mediaListRef = useRef<FlatList<DisplayedMediaItem>>(null);
  const hasAppliedInitialOffset = useRef(false);
  const [deleteActivityMedia, { isLoading: isDeletingMedia }] = useDeleteActivityMediaMutation();
  const mediaWidth = width < MAX_MOBILE_WIDTH ? Math.max(width, 0) : MAX_MOBILE_WIDTH;
  const mediaHeight = Math.min(
    Math.max(mediaWidth * ACTIVITY_MEDIA_HEIGHT_RATIO, ACTIVITY_MEDIA_MIN_HEIGHT),
    ACTIVITY_MEDIA_MAX_HEIGHT,
  );
  const isOwnActivity = Boolean(activityOwnerId && activityOwnerId === currentUserId);
  const canViewReplay = activity.profile?.allowActivityReplayViewing !== false || isOwnActivity;
  const [mediaAspectRatios, setMediaAspectRatios] = useState<Record<string, number>>({});
  const displayedMapPhotoUrl = hideMap
    ? isOwnActivity
      ? (mapPhotoUrl ?? routeOnlyMapPhotoUrl)
      : routeOnlyMapPhotoUrl
    : mapPhotoUrl;
  const displayedData = useMemo(() => {
    const activityMedia: DisplayedMediaItem[] = (media ?? []).map((item) => ({ ...item, isMap: false }));
    return displayedMapPhotoUrl
      ? [
          { url: displayedMapPhotoUrl, thumbnail: null, blurhash: hideMap ? null : mapPhotoUrlBlurhash, isMap: true },
          ...activityMedia,
        ]
      : activityMedia;
  }, [displayedMapPhotoUrl, hideMap, mapPhotoUrlBlurhash, media]);
  const showSideBySideMedia = !isFullView && displayedData.length > 1;
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

  const getMediaWidth = useCallback(
    (item: DisplayedMediaItem, mediaUrl: string) => {
      const aspectRatio = item.isMap ? ACTIVITY_MEDIA_ASPECT_RATIO : (mediaAspectRatios[mediaUrl] ?? 1);
      const minimumWidth = mediaHeight * 0.56;
      return Math.min(mediaWidth, Math.max(mediaHeight * aspectRatio, minimumWidth));
    },
    [mediaAspectRatios, mediaHeight, mediaWidth],
  );
  const handleMediaContentSizeChange = useCallback(() => {
    if (!showSideBySideMedia) {
      hasAppliedInitialOffset.current = false;
      return;
    }
    if (hasAppliedInitialOffset.current) return;
    if (!mediaListRef.current) return;

    hasAppliedInitialOffset.current = true;
    mediaListRef.current.scrollToOffset({ offset: mediaWidth / 2, animated: false });
  }, [mediaWidth, showSideBySideMedia]);
  const renderItem = useCallback(
    ({ item, index }: { item: (typeof displayedData)[number]; index: number }) => {
      const isMap = item.isMap === true;
      if (!item.url) {
        return (
          <View
            testID={`activity-media-${item.id ?? index}`}
            style={[styles.mediaTile, { height: mediaHeight, width: mediaWidth }]}>
            <MediaModerationPlaceholder
              status={item.mediaReviewStatus}
              testID={`pending-activity-media-${item.id ?? index}`}
            />
          </View>
        );
      }
      const mediaUrl = item.url;
      const isVideo = !isMap && isVideoUrl(mediaUrl);
      const itemWidth = getMediaWidth(item, mediaUrl);
      const onMediaMetadata = (metadata: { aspectRatio?: number }) => {
        if (!metadata.aspectRatio || !Number.isFinite(metadata.aspectRatio)) return;
        setMediaAspectRatios((current) =>
          current[mediaUrl] === metadata.aspectRatio ? current : { ...current, [mediaUrl]: metadata.aspectRatio! },
        );
      };
      const handleMediaPress = () => {
        if (isMap && hideMap && !isOwnActivity) return;
        if (isMap && !isOwnActivity && profile?.allowActivityReplayViewing === false) {
          return errorToast('Пользователь запретил просматривать информацию о своем маршруте');
        }
        if (isMap) {
          void dispatch(activityApi.util.prefetch('getLocationsByActivityId', { activityId: id }, { ifOlderThan: 60 }));
        }
        push(
          isMap
            ? `/${ROUTES.map}/${id}`
            : `/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(mediaUrl) : id}${createSearchParams({
                indexOfPhoto: index,
                blurhash: item.blurhash,
              })}`,
        );
      };
      const mediaAccessibilityLabel = isMap
        ? language === LANGUAGES.russian
          ? 'Открыть карту тренировки'
          : 'Open activity map'
        : language === LANGUAGES.russian
          ? 'Открыть медиа тренировки'
          : 'Open activity media';
      return (
        <View
          testID={isMap ? 'activity-map-media-container' : undefined}
          style={[styles.mediaTile, { height: mediaHeight, width: itemWidth }]}>
          {Platform.OS === 'web' && isVideo ? (
            <View
              testID={isMap ? 'activity-map-media-item' : `activity-media-${item.id ?? index}`}
              accessibilityLabel={mediaAccessibilityLabel}
              onClick={handleMediaPress}>
              <VideoMedia
                url={mediaUrl}
                thumbnail={item.thumbnail}
                blurhash={item.blurhash}
                width={itemWidth}
                height={mediaHeight}
                playLabel={language === LANGUAGES.russian ? 'Воспроизвести видео' : 'Play video'}
                pauseLabel={language === LANGUAGES.russian ? 'Приостановить видео' : 'Pause video'}
                muteLabel={language === LANGUAGES.russian ? 'Выключить звук видео' : 'Mute video'}
                unmuteLabel={language === LANGUAGES.russian ? 'Включить звук видео' : 'Unmute video'}
                testID={`activity-video-${item.id ?? index}`}
                onMetadata={onMediaMetadata}
              />
            </View>
          ) : (
            <TouchableRipple
              testID={isMap ? 'activity-map-media-item' : `activity-media-${item.id ?? index}`}
              onLongPress={
                !isMap && isOwnActivity && item.id
                  ? () => {
                      setSelectedMediaId((selectedId) => (selectedId === item.id ? null : (item.id ?? null)));
                    }
                  : undefined
              }
              disabled={isMap && hideMap && !isOwnActivity}
              onPress={handleMediaPress}
              borderless={false}
              style={{ height: mediaHeight, width: itemWidth }}
              accessibilityRole="button"
              accessibilityLabel={mediaAccessibilityLabel}>
              {isVideo ? (
                <VideoMedia
                  url={mediaUrl}
                  thumbnail={item.thumbnail}
                  blurhash={item.blurhash}
                  width={itemWidth}
                  height={mediaHeight}
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
                  source={{ uri: item.thumbnail ? item.thumbnail : mediaUrl }}
                  contentFit="cover"
                  placeholderContentFit="cover"
                  priority={index === 0 ? 'high' : 'normal'}
                  cachePolicy="memory-disk"
                  recyclingKey={mediaUrl}
                  testID={mediaUrl}
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
          )}
          {!isMap && isOwnActivity && item.id && selectedMediaId === item.id ? (
            <View style={styles.deleteButton}>
              <ActivityMediaDeleteBtn onDelete={() => void handleDeleteMedia(item.id!)} isDeleting={isDeletingMedia} />
            </View>
          ) : null}
          {isMap ? (
            <>
              <MapMetaOverlay
                locationName={locationName}
                weatherTemperature={weatherTemperature}
                weatherWindSpeed={weatherWindSpeed}
                weatherCode={weatherCode}
                emotion={emotion}
              />
              {isOwnActivity ? (
                <View pointerEvents="box-none" style={styles.favoriteButton}>
                  <FavoriteActivityBtn activityId={id} isFavorite={Boolean(isFavorite)} />
                </View>
              ) : null}
              <View pointerEvents="box-none" style={styles.mapActions}>
                {isOwnActivity ? <AddActivityMediaBtn activityId={id} media={media ?? []} /> : null}
                {canViewReplay && (!hideMap || isOwnActivity) ? (
                  <RouteReplayBtn activityId={id} userId={activityOwnerId} />
                ) : null}
              </View>
            </>
          ) : null}
          {!isOwnActivity && !isMap && item.id ? (
            <View style={styles.reportButton}>
              <ContentActionsMenu
                accessibilityLabel={
                  language === LANGUAGES.russian ? 'Дополнительные действия с медиа' : 'Media actions'
                }
                testID={`media-actions-menu-${item.id}`}
                reportLabel={language === LANGUAGES.russian ? 'Пожаловаться' : 'Report'}
                reportTestID={`report-media-${item.id}`}
                onReport={() => setReportedMediaId(item.id ?? null)}
              />
            </View>
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
      dispatch,
      locationName,
      weatherTemperature,
      weatherWindSpeed,
      weatherCode,
      emotion,
      id,
      isFavorite,
      media,
      canViewReplay,
      hideMap,
      activityOwnerId,
      profile?.allowActivityReplayViewing,
      push,
      handleDeleteMedia,
      setMediaAspectRatios,
      mediaWidth,
    ],
  );

  return (
    <>
      <FlatList
        ref={mediaListRef}
        data={displayedData}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={Platform.OS === 'web' ? { flexGrow: 0, height: mediaHeight + 8 } : undefined}
        testID="activity-media-list"
        contentContainerStyle={styles.listContent}
        onContentSizeChange={handleMediaContentSizeChange}
        initialNumToRender={Math.max(1, Math.min(displayedData.length, 3))}
        maxToRenderPerBatch={3}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={false}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        keyExtractor={(item, index) => item.id ?? item.url ?? String(index)}
      />
      <ReportContentDialog
        visible={Boolean(reportedMediaId)}
        targetType="media"
        targetId={reportedMediaId ?? ''}
        onDismiss={() => setReportedMediaId(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingVertical: 4 },
  itemSeparator: { width: 8 },
  reportButton: { position: 'absolute', right: 4, top: 4 },
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
  favoriteButton: { position: 'absolute', right: 8, top: 8, zIndex: 4 },
  mapActions: {
    alignItems: 'center',
    bottom: 8,
    flexDirection: 'row',
    gap: 4,
    position: 'absolute',
    right: 8,
    zIndex: 3,
  },
});
