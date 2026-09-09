import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { removePhotoUrl } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { deletePhotos } from '@U/file-sending';
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
      await deletePhotos([image, thumbnail].filter((photo): photo is string => Boolean(photo)));
      setImages(images.filter(({ url }) => url !== image));
      dispatch(removePhotoUrl(image));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <IconButton
      icon={isDeleting ? 'progress-clock' : 'close'}
      size={compact ? 13 : 15}
      iconColor={colors.onError}
      containerColor={colors.error}
      mode="contained-tonal"
      style={[styles.closeBtn, compact && styles.compactCloseBtn]}
      onPress={() => void deleteImage()}
      disabled={shouldBeDisabled}
      testID="deleteIcon"
    />
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    elevation: 8,
    height: 32,
    position: 'absolute',
    right: 2,
    top: 5,
    width: 32,
    zIndex: 10,
  },
  compactCloseBtn: { height: 28, right: 2, top: 2, width: 28 },
});
