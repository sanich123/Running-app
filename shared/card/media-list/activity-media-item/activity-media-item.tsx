import { useCallback, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableRipple } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { createSearchParams } from '@R/runich-api/create-search-params';
import { activityApi, useDeleteActivityMediaMutation } from '@R/services/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { isVideoUrl } from '@Routes/photo-viewer/utils';
import CustomImage from '@S/custom-image/custom-image';
import { errorToast } from '@S/error-toast/error-toast';
import MediaModerationPlaceholder from '@S/media-moderation-placeholder/media-moderation-placeholder';
import ContentActionsMenu from '@S/moderation/content-actions-menu/content-actions-menu';
import ReportContentDialog from '@S/moderation/report-content-dialog/report-content-dialog';
import { useActivityCard } from '../../context';
import ActivityMapOverlays from '../activity-map-overlays/activity-map-overlays';
import { ACTIVITY_MEDIA_ASPECT_RATIO } from '../const';
import { getActivityMediaDimensions } from '../utils';
import VideoMedia from '../video-media/video-media';
import { ACTIVITY_MEDIA_COPY } from './const';
import type { VideoMetadata } from '../types';
import type { ActivityMediaItemProps } from './types';

export default function ActivityMediaItem({
  item: { id: mediaId, url: mediaUrl, isMap = false, mediaReviewStatus, blurhash, thumbnail, aspectRatio },
  index,
}: ActivityMediaItemProps) {
  const { width } = useWindowDimensions();
  const { mediaWidth, mediaHeight } = getActivityMediaDimensions(width);
  const { activity } = useActivityCard();
  const { id: activityId, userId: activityOwnerId, hideMap, profile } = activity;
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const storedAspectRatio =
    typeof aspectRatio === 'number' && Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : undefined;
  const [loadedAspectRatio, setLoadedAspectRatio] = useState<{ mediaUrl: string; aspectRatio: number } | null>(null);
  const mediaAspectRatio =
    storedAspectRatio ??
    (loadedAspectRatio && loadedAspectRatio.mediaUrl === mediaUrl ? loadedAspectRatio.aspectRatio : 1);
  const [reportedMediaId, setReportedMediaId] = useState<string | null>(null);
  const [deleteActivityMedia, { isLoading: isDeletingMedia }] = useDeleteActivityMediaMutation();
  const isOwnActivity = activityOwnerId === currentUserId;
  const { openMap, openMedia, playVideo, pauseVideo, muteVideo, unmuteVideo, mediaActions, report, restrictedRoute } =
    ACTIVITY_MEDIA_COPY[language];

  const handleDeleteMedia = useCallback(async () => {
    if (!mediaId) return;
    try {
      await deleteActivityMedia({ activityId, mediaId }).unwrap();
    } catch (error) {
      errorToast('', error);
    }
  }, [activityId, deleteActivityMedia, mediaId]);
  const handleMediaMetadata = useCallback(
    ({ aspectRatio: loadedAspectRatio }: VideoMetadata) => {
      if (
        storedAspectRatio !== undefined ||
        !mediaUrl ||
        loadedAspectRatio === undefined ||
        !Number.isFinite(loadedAspectRatio) ||
        loadedAspectRatio <= 0
      ) {
        return;
      }
      setLoadedAspectRatio({ mediaUrl, aspectRatio: loadedAspectRatio });
    },
    [mediaUrl, storedAspectRatio],
  );
  const isAwaitingReview = ['queued', 'processing', 'review_required'].includes(mediaReviewStatus ?? '');

  if (!mediaUrl) {
    return (
      <View
        testID={`activity-media-${mediaId ?? index}`}
        style={[styles.mediaTile, { height: mediaHeight, width: Math.min(mediaWidth, mediaHeight * 0.75) }]}>
        <MediaModerationPlaceholder
          status={mediaReviewStatus}
          blurhash={blurhash}
          borderRadius={10}
          compact
          showStatus={false}
          testID={`pending-activity-media-${mediaId ?? index}`}
        />
        {!isOwnActivity && isAwaitingReview ? (
          <MediaModerationPlaceholder status={mediaReviewStatus} compact overlay />
        ) : null}
      </View>
    );
  }

  const isVideo = !isMap && isVideoUrl(mediaUrl);
  const itemWidth = Math.min(
    mediaWidth,
    Math.max(mediaHeight * (isMap ? ACTIVITY_MEDIA_ASPECT_RATIO : mediaAspectRatio), mediaHeight * 0.56),
  );

  const handleMediaPress = () => {
    if (isMap && hideMap && !isOwnActivity) return;
    if (isMap && !isOwnActivity && profile?.allowActivityReplayViewing === false) {
      return errorToast(restrictedRoute);
    }
    if (isMap) {
      void dispatch(activityApi.util.prefetch('getLocationsByActivityId', { activityId }, { ifOlderThan: 60 }));
    }
    push(
      isMap
        ? `/${ROUTES.map}/${activityId}`
        : `/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(mediaUrl) : activityId}${createSearchParams({
            indexOfPhoto: index,
            blurhash,
          })}`,
    );
  };

  return (
    <View
      testID={isMap ? 'activity-map-media-container' : `activity-media-container-${mediaId ?? index}`}
      style={[styles.mediaTile, { height: mediaHeight, width: itemWidth }]}>
      {Platform.OS === 'web' && isVideo ? (
        <View
          testID={isMap ? 'activity-map-media-item' : `activity-media-${mediaId ?? index}`}
          accessibilityLabel={isMap ? openMap : openMedia}
          onClick={handleMediaPress}>
          <VideoMedia
            url={mediaUrl}
            thumbnail={thumbnail}
            blurhash={blurhash}
            width={itemWidth}
            height={mediaHeight}
            playLabel={playVideo}
            pauseLabel={pauseVideo}
            muteLabel={muteVideo}
            unmuteLabel={unmuteVideo}
            testID={`activity-video-${mediaId ?? index}`}
            onMetadata={handleMediaMetadata}
          />
        </View>
      ) : (
        <TouchableRipple
          testID={isMap ? 'activity-map-media-item' : `activity-media-${mediaId ?? index}`}
          disabled={isMap && hideMap && !isOwnActivity}
          onPress={handleMediaPress}
          borderless={false}
          style={{ height: mediaHeight, width: '100%' }}
          accessibilityRole="button"
          accessibilityLabel={isMap ? openMap : openMedia}>
          {isVideo ? (
            <VideoMedia
              url={mediaUrl}
              thumbnail={thumbnail}
              blurhash={blurhash}
              width={itemWidth}
              height={mediaHeight}
              playLabel={playVideo}
              pauseLabel={pauseVideo}
              muteLabel={muteVideo}
              unmuteLabel={unmuteVideo}
              testID={`activity-video-${mediaId ?? index}`}
              onMetadata={handleMediaMetadata}
            />
          ) : (
            <CustomImage
              style={{ width: '100%', height: mediaHeight }}
              source={{ uri: thumbnail ? thumbnail : mediaUrl }}
              contentFit="cover"
              placeholderContentFit="cover"
              blurRadius={isAwaitingReview && !isOwnActivity ? 20 : undefined}
              priority={index === 0 ? 'high' : 'normal'}
              cachePolicy="memory-disk"
              recyclingKey={mediaUrl}
              testID={mediaUrl}
              placeholder={blurhash}
              onLoad={({ source: { width: loadedWidth, height: loadedHeight } }) => {
                if (loadedWidth > 0 && loadedHeight > 0) {
                  handleMediaMetadata({ aspectRatio: loadedWidth / loadedHeight });
                }
              }}
            />
          )}
        </TouchableRipple>
      )}
      {!isOwnActivity && isAwaitingReview ? (
        <MediaModerationPlaceholder status={mediaReviewStatus} compact overlay />
      ) : null}
      {isMap ? <ActivityMapOverlays /> : null}
      {!isMap && mediaId ? (
        <View style={styles.reportButton}>
          <ContentActionsMenu
            accessibilityLabel={mediaActions}
            iconColor="#fff"
            testID={`media-actions-menu-${mediaId}`}
            reportLabel={report}
            reportTestID={`report-media-${mediaId}`}
            onReport={() => setReportedMediaId(mediaId)}
            showReport={!isOwnActivity}
            additionalActions={
              isOwnActivity
                ? [
                    {
                      label: ACTIVITY_MEDIA_COPY[language].deleteMedia,
                      testID: `delete-media-${mediaId}`,
                      leadingIcon: 'delete-outline',
                      systemImage: 'trash',
                      onPress: () => void handleDeleteMedia(),
                      destructive: true,
                      disabled: isDeletingMedia,
                    },
                  ]
                : undefined
            }
          />
        </View>
      ) : null}
      <ReportContentDialog
        visible={Boolean(reportedMediaId)}
        targetType="media"
        targetId={reportedMediaId ?? ''}
        onDismiss={() => setReportedMediaId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mediaTile: {
    borderCurve: 'continuous',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  reportButton: { position: 'absolute', right: 4, top: 4, zIndex: 2 },
});
