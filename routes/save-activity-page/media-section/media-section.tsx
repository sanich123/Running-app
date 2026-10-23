import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import PreviewImages from '../preview-images/preview-images';
import ShowCameraBtn from '../show-camera-btn/show-camera-btn';
import { MAX_ACTIVITY_MEDIA, UPLOAD_PHOTO_BTN } from '../upload-photos-btn/ const';
import UploadPhotosBtn from '../upload-photos-btn/upload-photos-btn';
import type { MediaSectionProps } from './types';
import type { MediaUploadStatus } from '../upload-photos-btn/ const';

export default function MediaSection({ images, isEditingActivity, activityId, setImages }: MediaSectionProps) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const [isMediaUploadDisabled, setIsMediaUploadDisabled] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<MediaUploadStatus | null>(null);
  const isAtMediaLimit = images.length >= MAX_ACTIVITY_MEDIA;
  const uploadCopy = UPLOAD_PHOTO_BTN[language];
  const progress = Math.max(0, Math.min(uploadStatus?.progress ?? 0, 1));

  return (
    <View style={isEditingActivity ? styles.editMedia : undefined}>
      <View style={styles.mediaButtons}>
        <View style={[styles.mediaButtonRow, uploadStatus && styles.hiddenMediaButtonRow]}>
          <UploadPhotosBtn
            isDisabled={isMediaUploadDisabled}
            setIsDisabled={setIsMediaUploadDisabled}
            setImages={setImages}
            images={images}
            activityId={activityId}
            onUploadStatusChange={setUploadStatus}
          />
          <ShowCameraBtn isDisabled={isMediaUploadDisabled || isAtMediaLimit} />
        </View>
        {uploadStatus && (
          <View style={[styles.uploadStatus, { borderColor: colors.outlineVariant }]}>
            <View style={styles.uploadStatusHeader}>
              <Text variant="bodyMedium" style={[styles.uploadStatusLabel, { color: colors.onSurface }]}>
                {uploadStatus.phase === 'compressing' ? uploadCopy.compressing : uploadCopy.uploading}
              </Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurface }}>
                {Math.round(progress * 100)}%
              </Text>
              <Pressable
                onPress={uploadStatus.cancel}
                style={styles.cancelUploadButton}
                accessibilityRole="button"
                accessibilityLabel={
                  uploadStatus.phase === 'compressing' ? uploadCopy.cancelCompression : uploadCopy.cancelUpload
                }
                testID="cancel-media-upload-button">
                <Icon source="close" size={22} color={colors.onSurface} />
              </Pressable>
            </View>
            <View
              style={[styles.progressTrack, { backgroundColor: colors.surfaceVariant }]}
              accessible
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
            </View>
          </View>
        )}
      </View>
      <Text style={[styles.mediaHint, { color: colors.onSurfaceVariant }]}>{uploadCopy.uploadHint}</Text>
      <PreviewImages
        setImages={setImages}
        images={images}
        isDisabled={isEditingActivity ? false : isMediaUploadDisabled}
        activityId={isEditingActivity ? activityId : undefined}
        isPersistedActivityMedia={isEditingActivity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mediaButtons: { marginHorizontal: 4, minHeight: 60 },
  mediaButtonRow: { flexDirection: 'row', gap: 8 },
  hiddenMediaButtonRow: { display: 'none' },
  uploadStatus: { borderRadius: 8, borderWidth: 1, justifyContent: 'center', minHeight: 60, paddingHorizontal: 12 },
  uploadStatusHeader: { alignItems: 'center', flexDirection: 'row', gap: 10, marginBottom: 7 },
  uploadStatusLabel: { flex: 1 },
  cancelUploadButton: { alignItems: 'center', height: 32, justifyContent: 'center', width: 32 },
  progressTrack: { borderRadius: 2, height: 4, overflow: 'hidden', width: '100%' },
  progressFill: { height: '100%' },
  editMedia: { gap: 8, marginHorizontal: 4 },
  mediaHint: { fontSize: 12, lineHeight: 17, marginHorizontal: 4, marginTop: 6, textAlign: 'center' },
});
