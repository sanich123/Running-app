import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import PreviewImages from '../preview-images/preview-images';
import ShowCameraBtn from '../show-camera-btn/show-camera-btn';
import { UPLOAD_PHOTO_BTN } from '../upload-photos-btn/ const';
import UploadPhotosBtn from '../upload-photos-btn/upload-photos-btn';
import type { ActivityPhoto } from '@R/slices/activity/types';

interface MediaSectionProps {
  images: ActivityPhoto[];
  isEditingActivity: boolean;
  activityId?: string;
  setImages: (arg: ActivityPhoto[]) => void;
}

export default function MediaSection({ images, isEditingActivity, activityId, setImages }: MediaSectionProps) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const [isMediaUploadDisabled, setIsMediaUploadDisabled] = useState(false);

  if (isEditingActivity) {
    if (!images.length) return null;

    return (
      <View style={styles.editMedia}>
        <Text variant="titleSmall" style={{ color: colors.onSurface }}>
          {UPLOAD_PHOTO_BTN[language].activityMedia}
        </Text>
        <PreviewImages
          setImages={setImages}
          images={images}
          isDisabled={false}
          activityId={activityId}
          isPersistedActivityMedia
        />
      </View>
    );
  }

  return (
    <>
      <View style={styles.mediaButtons}>
        <UploadPhotosBtn
          isDisabled={isMediaUploadDisabled}
          setIsDisabled={setIsMediaUploadDisabled}
          setImages={setImages}
          images={images}
        />
        <ShowCameraBtn isDisabled={isMediaUploadDisabled} />
      </View>
      <Text style={[styles.mediaHint, { color: colors.onSurfaceVariant }]}>
        {UPLOAD_PHOTO_BTN[language].uploadHint}
      </Text>
      <PreviewImages setImages={setImages} images={images} isDisabled={isMediaUploadDisabled} />
    </>
  );
}

const styles = StyleSheet.create({
  mediaButtons: { flexDirection: 'row', gap: 8, marginHorizontal: 4 },
  editMedia: { gap: 8, marginHorizontal: 4 },
  mediaHint: { fontSize: 12, lineHeight: 17, marginHorizontal: 4, marginTop: 6, textAlign: 'center' },
});
