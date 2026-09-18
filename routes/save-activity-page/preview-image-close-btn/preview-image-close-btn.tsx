import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { removePhotoUrl } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { deleteUploadedMedia } from '@U/file-sending';
import type { PreviewImagesProps } from '../preview-images/types';

export default function PreviewImageCloseBtn({
  setImages,
  images,
  isDisabled,
  image,
  thumbnail,
  compact = false,
}: PreviewImagesProps & { image: string; thumbnail?: string | null }) {
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const shouldBeDisabled = isDisabled || isSavingDisabled || isDeleting;

  async function deleteImage() {
    setIsDeleting(true);
    try {
      const isDeleted = await deleteUploadedMedia(
        [image, thumbnail].filter((photo): photo is string => Boolean(photo)),
      );
      if (isDeleted) {
        setImages(images.filter(({ url }) => url !== image));
        dispatch(removePhotoUrl(image));
      }
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
      disabled={shouldBeDisabled}
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
  compactCloseBtn: { top: 5 },
});
