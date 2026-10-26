import { useCallback, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableRipple } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { createSearchParams } from '@R/runich-api/create-search-params';
import { activityApi, useDeleteActivityMediaMutation } from '@R/services/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { isVideoUrl } from '@Routes/photo-viewer/utils';
import ActivityMediaDeleteBtn from '@S/activity-media/activity-media-delete-btn/activity-media-delete-btn';
import CustomImage from '@S/custom-image/custom-image';
import { errorToast } from '@S/error-toast/error-toast';
import MediaModerationPlaceholder from '@S/media-moderation-placeholder/media-moderation-placeholder';
import ContentActionsMenu from '@S/moderation/content-actions-menu/content-actions-menu';
import ReportContentDialog from '@S/moderation/report-content-dialog/report-content-dialog';
import { ACTIVITY_MEDIA_COPY } from './const';
import { useActivityCard } from '../../context';
import ActivityMapOverlays from '../activity-map-overlays/activity-map-overlays';
import { ACTIVITY_MEDIA_ASPECT_RATIO } from '../const';
import { getActivityMediaDimensions } from '../utils';
import VideoMedia from '../video-media/video-media';
import type { ActivityMediaItemProps } from './types';
import type { VideoMetadata } from '../types';

export default function ActivityMediaItem({
  item: { id: mediaId, url: mediaUrl, isMap = false, mediaReviewStatus, blurhash, thumbnail },
  index,
  selectedMediaId,
  onToggleDelete,
  onDeleteSuccess,
}: ActivityMediaItemProps) {
  const { width } = useWindowDimensions();
  const { mediaWidth, mediaHeight } = getActivityMediaDimensions(width);
  const { activity } = useActivityCard();
  const { id: activityId, userId: activityOwnerId, hideMap, profile } = activity;
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const [mediaAspectRatio, setMediaAspectRatio] = useState(1);
  const [reportedMediaId, setReportedMediaId] = useState<string | null>(null);
  const [deleteActivityMedia, { isLoading: isDeletingMedia }] = useDeleteActivityMediaMutation();
  const isOwnActivity = activityOwnerId === currentUserId;
  const { openMap, openMedia, playVideo, pauseVideo, muteVideo, unmuteVideo, mediaActions, report, restrictedRoute } =
    ACTIVITY_MEDIA_COPY[language];

  const handleDeleteMedia = useCallback(async () => {
    if (!mediaId) return;
    try {
      await deleteActivityMedia({ activityId, mediaId }).unwrap();
      onDeleteSuccess();
    } catch (error) {
      errorToast('', error);
    }
  }, [activityId, deleteActivityMedia, mediaId, onDeleteSuccess]);
  const handleMediaMetadata = useCallback(({ aspectRatio }: VideoMetadata) => {
    if (!aspectRatio || !Number.isFinite(aspectRatio)) return;
    setMediaAspectRatio((current) => (current === aspectRatio ? current : aspectRatio));
  }, []);
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
      testID={isMap ? 'activity-map-media-container' : undefined}
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
          onLongPress={!isMap && isOwnActivity && mediaId ? () => onToggleDelete(mediaId) : undefined}
          disabled={isMap && hideMap && !isOwnActivity}
          onPress={handleMediaPress}
          borderless={false}
          style={{ height: mediaHeight, width: itemWidth }}
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
              style={{ width: itemWidth, height: mediaHeight }}
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
      {!isMap && isOwnActivity && mediaId && selectedMediaId === mediaId ? (
        <View style={styles.deleteButton}>
          <ActivityMediaDeleteBtn onDelete={() => void handleDeleteMedia()} isDeleting={isDeletingMedia} />
        </View>
      ) : null}
      {isMap ? <ActivityMapOverlays /> : null}
      {!isOwnActivity && !isMap && mediaId ? (
        <View style={styles.reportButton}>
          <ContentActionsMenu
            accessibilityLabel={mediaActions}
            iconColor="#fff"
            testID={`media-actions-menu-${mediaId}`}
            reportLabel={report}
            reportTestID={`report-media-${mediaId}`}
            onReport={() => setReportedMediaId(mediaId)}
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
  deleteButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 4,
  },
  reportButton: { position: 'absolute', right: 4, top: 4 },
});
