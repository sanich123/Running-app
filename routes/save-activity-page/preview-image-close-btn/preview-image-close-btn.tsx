import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useDeleteActivityMediaMutation } from '@R/services/activity/activity';
import { removePhotoUrl } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { deleteUploadedMedia } from '@U/file-sending';
import type { PreviewImageCloseBtnProps } from './types';

export default function PreviewImageCloseBtn({
  setImages,
  images,
  isDisabled,
  media,
  image,
  thumbnail,
  compact = false,
  activityId,
  isPersistedActivityMedia = false,
}: PreviewImageCloseBtnProps) {
  const mediaItem = media ?? { url: image, thumbnail: thumbnail ?? null };
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteActivityMedia] = useDeleteActivityMediaMutation();
  const shouldBeDisabled = isDisabled || isSavingDisabled || isDeleting;

  async function deleteImage() {
    setIsDeleting(true);
    try {
      const isPersistedMedia = isPersistedActivityMedia || Boolean(mediaItem.id);
      if (isPersistedMedia) {
        if (!activityId || !mediaItem.id) {
          errorToast('Не удалось определить фото или видео активности');
          return;
        }
        await deleteActivityMedia({ activityId, mediaId: mediaItem.id }).unwrap();
      } else {
        const assetIds = [mediaItem.assetId, mediaItem.thumbnailAssetId].filter(
          (assetId): assetId is string => !!assetId,
        );
        const publicUrls = assetIds.length
          ? []
          : [mediaItem.url, mediaItem.thumbnail].filter((photo): photo is string => Boolean(photo));
        const isDeleted = await deleteUploadedMedia(publicUrls, assetIds);
        if (!isDeleted) return;
      }

      setImages(images.filter((image) => image !== mediaItem));
      dispatch(removePhotoUrl({ url: mediaItem.url, assetId: mediaItem.assetId, id: mediaItem.id }));
    } catch (error) {
      errorToast('', error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <IconButton
      icon={isDeleting ? 'progress-clock' : 'close'}
      size={14}
      iconColor={colors.onSurfaceVariant}
      containerColor={colors.surfaceVariant}
      mode="contained"
      style={[styles.closeBtn, { borderColor: colors.surface }, compact && styles.compactCloseBtn]}
      onPress={() => void deleteImage()}
      disabled={
        shouldBeDisabled || ((isPersistedActivityMedia || Boolean(mediaItem.id)) && (!activityId || !mediaItem.id))
      }
      testID="deleteIcon"
    />
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 16,
    borderWidth: 2,
    elevation: 8,
    height: 30,
    justifyContent: 'center',
    margin: 0,
    padding: 0,
    position: 'absolute',
    right: -2,
    top: 5,
    width: 30,
    zIndex: 10,
  },
  compactCloseBtn: { top: 0 },
});
