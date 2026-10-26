import { useState } from 'react';
import { Platform, useWindowDimensions, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TouchableRipple } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { LANGUAGES, ROUTES } from '@const/enums';
import { createSearchParams } from '@R/runich-api/create-search-params';
import { useDeleteActivityMediaMutation } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import ActivityMediaDeleteBtn from '@S/activity-media/activity-media-delete-btn/activity-media-delete-btn';
import { errorToast } from '@S/error-toast/error-toast';
import MediaModerationPlaceholder from '@S/media-moderation-placeholder/media-moderation-placeholder';
import MediaThumbnail from '@S/media-thumbnail/media-thumbnail';
import useLongPressGuard from '@S/pressable/use-long-press-guard';
import { getMediaGridCellSize } from '../../const';
import type { ActivityMediaItem } from '@S/card/types';

export default function MediaGridImage({
  id,
  activityId,
  url,
  thumbnail,
  blurhash,
  contentType,
  mediaReviewStatus,
  index,
  take,
}: ActivityMediaItem & { index: number; take: number }) {
  const { push } = useRouter();
  const { width } = useWindowDimensions();
  const { id: userId } = useLocalSearchParams();
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const [deleteActivityMedia, { isLoading: isDeletingMedia }] = useDeleteActivityMediaMutation();
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(false);
  const longPressGuard = useLongPressGuard();
  const widthOfScreen = width < MAX_MOBILE_WIDTH ? width : MAX_MOBILE_WIDTH;
  const cellSize = getMediaGridCellSize(widthOfScreen);
  const isOwnProfile = userId === currentUserId;
  const canDeleteMedia = Boolean(id && activityId && isOwnProfile);

  const handleDelete = async () => {
    if (!activityId || !id) return;
    try {
      await deleteActivityMedia({ activityId, mediaId: id }).unwrap();
      setIsDeleteButtonVisible(false);
    } catch (error) {
      errorToast('', error);
    }
  };

  return (
    <View style={[styles.container, { height: cellSize, width: cellSize }]}>
      {url ? (
        <TouchableRipple
          testID={`media-grid-image-${id ?? index}`}
          key={url}
          onPressIn={longPressGuard.resetForGesture}
          onLongPress={
            canDeleteMedia
              ? () => {
                  longPressGuard.markLongPress();
                  setIsDeleteButtonVisible(true);
                }
              : undefined
          }
          disabled={isDeleteButtonVisible}
          onPress={() => {
            if (!longPressGuard.shouldHandlePress()) return;
            push(
              `/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(url) : index}${createSearchParams({
                userId,
                take,
                blurhash,
              })}`,
            );
          }}
          accessibilityRole="button"
          accessibilityLabel={url}
          borderless>
          <MediaThumbnail
            testID={url}
            style={{ height: cellSize, width: cellSize }}
            mediaUrl={url}
            thumbnail={thumbnail}
            isVideo={contentType?.startsWith('video/') || undefined}
            placeholder={blurhash}
          />
        </TouchableRipple>
      ) : (
        <TouchableRipple
          testID={`pending-media-grid-${id ?? index}`}
          style={{ height: cellSize, width: cellSize }}
          onPressIn={longPressGuard.resetForGesture}
          onLongPress={
            canDeleteMedia
              ? () => {
                  longPressGuard.markLongPress();
                  setIsDeleteButtonVisible(true);
                }
              : undefined
          }
          disabled={isDeleteButtonVisible}
          accessibilityRole="button"
          accessibilityLabel={language === LANGUAGES.russian ? 'Медиа на проверке' : 'Media under review'}
          borderless>
          <MediaModerationPlaceholder
            status={mediaReviewStatus}
            blurhash={blurhash}
            borderRadius={10}
            compact
            hideTitle={cellSize < 130}
            showStatus={false}
          />
        </TouchableRipple>
      )}
      {!isOwnProfile && mediaReviewStatus && mediaReviewStatus !== 'approved' && mediaReviewStatus !== 'rejected' ? (
        <MediaModerationPlaceholder status={mediaReviewStatus} compact overlay />
      ) : null}
      {canDeleteMedia && isDeleteButtonVisible ? (
        <View style={styles.deleteButton}>
          <ActivityMediaDeleteBtn onDelete={() => void handleDelete()} isDeleting={isDeletingMedia} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 10, overflow: 'hidden', position: 'relative' },
  deleteButton: {
    position: 'absolute',
    right: 4,
    top: 4,
    zIndex: 2,
  },
});
