import { useRef, useState } from 'react';
import uuid from 'react-native-uuid';
import { Platform, Pressable, View, StyleSheet } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';
import { useAppendActivityMediaMutation } from '@R/services/activity/activity';
import { addPhotoUrls } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { deleteUploadedMedia, getAccessToGallery } from '@U/file-sending';
import UploadProgress from '../upload-progress/upload-progress';
import { uploadActivityMediaBatch } from '../utils';
import { MAX_ACTIVITY_MEDIA, UPLOAD_PHOTO_BTN } from './ const';
import type { UploadPhotoBtnProps } from './ const';
import type { MediaUploadControl, MediaUploadItem, MediaUploadPhase } from '@U/file-sending';

export default function UploadPhotosBtn({
  isDisabled,
  setIsDisabled,
  setImages,
  images,
  activityId,
  onUploadStatusChange,
}: UploadPhotoBtnProps) {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const [isUploading, setIsUploading] = useState(false);
  const [appendActivityMedia] = useAppendActivityMediaMutation();
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { colors } = useTheme();
  const hasReachedMediaLimit = images.length >= MAX_ACTIVITY_MEDIA;
  const shouldBeDisabled = isDisabled || isSavingDisabled || hasReachedMediaLimit;

  async function appendUploadedMedia(mediaToUpload: MediaUploadItem[], control?: MediaUploadControl) {
    const uploadedResult = await uploadActivityMediaBatch(mediaToUpload, control);
    if (control?.signal?.aborted) return;

    const uploadedMedia = uploadedResult.filter((media): media is NonNullable<typeof media> => media !== null);
    if (!uploadedMedia.length) return;

    if (activityId) {
      try {
        const response = await appendActivityMedia({
          id: activityId,
          media: uploadedMedia.map(({ url, thumbnail, blurhash, assetId, thumbnailAssetId }) => ({
            ...(url && !assetId ? { url } : {}),
            thumbnail: thumbnail ?? null,
            ...(blurhash ? { blurhash } : {}),
            ...(assetId ? { assetId } : {}),
            ...(thumbnailAssetId ? { thumbnailAssetId } : {}),
          })),
        }).unwrap();
        setImages([...images, ...response.media]);
        dispatch(addPhotoUrls(response.media));
      } catch (error) {
        const assetIds = uploadedMedia
          .flatMap(({ assetId, thumbnailAssetId }) => [assetId, thumbnailAssetId])
          .filter((assetId): assetId is string => Boolean(assetId));
        const publicUrls = uploadedMedia
          .filter(({ assetId }) => !assetId)
          .flatMap(({ url, thumbnail }) => [url, thumbnail].filter((photo): photo is string => !!photo));
        await deleteUploadedMedia(publicUrls, assetIds);
        throw error;
      }
      return;
    }

    setImages([...images, ...uploadedMedia]);
    dispatch(addPhotoUrls(uploadedMedia));
  }

  async function uploadSelectedMedia(mediaToUpload: MediaUploadItem[]) {
    const controller = new AbortController();
    uploadControllerRef.current = controller;
    setIsUploading(true);
    setUploadProgress(0);
    const updateUploadStatus = (phase: MediaUploadPhase, progress: number) => {
      if (!controller.signal.aborted) {
        onUploadStatusChange?.({ phase, progress, cancel: () => controller.abort() });
      }
    };
    updateUploadStatus('compressing', 0);

    try {
      await appendUploadedMedia(mediaToUpload, {
        onProgress: setUploadProgress,
        onStatusProgress: updateUploadStatus,
        signal: controller.signal,
      });
    } catch (error) {
      if (!controller.signal.aborted) errorToast('', error);
    } finally {
      if (uploadControllerRef.current === controller) uploadControllerRef.current = null;
      setIsUploading(false);
      setUploadProgress(0);
      onUploadStatusChange?.(null);
    }
  }

  return (
    <View style={styles.container}>
      {isUploading ? (
        <Pressable
          onPress={() => uploadControllerRef.current?.abort()}
          style={[styles.iconButton, styles.progressButton, { borderColor: colors.outlineVariant }]}
          accessibilityLabel={UPLOAD_PHOTO_BTN[language].cancelUpload}
          accessibilityRole="button"
          testID="cancel-gallery-upload-button">
          <UploadProgress progress={uploadProgress} size={32} testID="gallery-upload-progress" />
        </Pressable>
      ) : Platform.OS === 'web' ? (
        <>
          <input
            ref={inputRef}
            style={{ display: 'none' }}
            type="file"
            accept="image/*,video/mp4,video/quicktime,video/webm"
            multiple
            disabled={shouldBeDisabled}
            onChange={async (e) => {
              const remainingSlots = MAX_ACTIVITY_MEDIA - images.length;
              const selectedFiles = e.target.files ? Array.from(e.target.files).slice(0, remainingSlots) : [];
              e.target.value = '';
              if (userId && selectedFiles.length) {
                try {
                  setIsDisabled(true);
                  await uploadSelectedMedia(
                    selectedFiles.map((fileSrc) => ({
                      fileSrc,
                      metadata: {
                        fileName: fileSrc.name,
                        mimeType: fileSrc.type,
                        mediaType: fileSrc.type?.startsWith('video/') ? 'video' : 'image',
                      },
                      mediaId: String(uuid.v4()),
                    })),
                  );
                } catch (error) {
                  errorToast('', error);
                } finally {
                  setIsDisabled(false);
                }
              }
            }}
          />
          <Pressable
            onPress={() => inputRef.current?.click()}
            style={[
              styles.iconButton,
              { borderColor: colors.outlineVariant },
              shouldBeDisabled && styles.disabledButton,
            ]}
            accessibilityRole="button"
            accessibilityLabel={UPLOAD_PHOTO_BTN[language].accessibilityLabel}
            testID="upload-gallery-button"
            disabled={shouldBeDisabled}>
            <Icon source="image-multiple-outline" size={28} color={colors.onSurface} />
          </Pressable>
        </>
      ) : (
        <Pressable
          onPress={async () => {
            setIsDisabled(true);
            try {
              const remainingSlots = MAX_ACTIVITY_MEDIA - images.length;
              const result = await getAccessToGallery(['images', 'videos'], {
                allowsMultipleSelection: true,
                selectionLimit: remainingSlots,
              });
              const selectedAssets = result?.assets?.slice(0, remainingSlots) ?? [];
              if (userId && result && !result.canceled && selectedAssets.length) {
                await uploadSelectedMedia(
                  selectedAssets.map((asset) => ({
                    fileSrc: asset.file ?? asset.uri,
                    metadata: {
                      fileName: asset.fileName,
                      mimeType: asset.mimeType,
                      mediaType: asset.type === 'video' ? 'video' : 'image',
                    },
                    mediaId: String(uuid.v4()),
                  })),
                );
              }
            } catch (error) {
              errorToast('', error);
            } finally {
              setIsDisabled(false);
            }
          }}
          style={({ pressed }) => [
            styles.iconButton,
            { borderColor: colors.outlineVariant },
            shouldBeDisabled && styles.disabledButton,
            pressed && !shouldBeDisabled && styles.pressedButton,
          ]}
          accessibilityLabel={UPLOAD_PHOTO_BTN[language].accessibilityLabel}
          accessibilityRole="button"
          testID="upload-gallery-button"
          disabled={shouldBeDisabled}>
          <Icon source="image-multiple-outline" size={28} color={colors.onSurface} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  iconButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 48,
    justifyContent: 'center',
    marginTop: 12,
    width: '100%',
  },
  disabledButton: { opacity: 0.7 },
  pressedButton: { opacity: 0.7 },
  progressButton: { paddingHorizontal: 12 },
});
