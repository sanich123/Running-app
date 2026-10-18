import { useRef, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import uuid from 'react-native-uuid';
import { Pressable, View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAppendActivityMediaMutation } from '@R/services/activity/activity';
import { addPhotoUrl } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { deleteUploadedMedia } from '@U/file-sending';
import UploadProgress from '../../upload-progress/upload-progress';
import { uploadActivityMediaBatch } from '../../utils';
import { CAMERA_SETTINGS, CAMERA_TEXT } from '../const';
import type { ShotBtnProps } from '../types';

export default function ShotBtn({ cameraRef, setPhotos, photos, maxPhotos = 10, activityId }: ShotBtnProps) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language, saveCameraPhotosToGallery } = useAppSelector(({ settings }) => settings);
  const [isLoading, setIsLoading] = useState(false);
  const [appendActivityMedia] = useAppendActivityMediaMutation();
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadControllerRef = useRef<AbortController | null>(null);
  const copy = CAMERA_TEXT[language];

  return (
    <Pressable
      testID="camera-shot-button"
      accessibilityRole="button"
      accessibilityLabel={isLoading ? copy.cancelUpload : copy.title}
      disabled={photos.length >= maxPhotos}
      style={({ pressed }) => [styles.shutter, pressed && !isLoading && styles.pressed, isLoading && styles.loading]}
      onPress={async () => {
        if (isLoading) {
          uploadControllerRef.current?.abort();
          return;
        }

        setIsLoading(true);
        setUploadProgress(0);
        const controller = new AbortController();
        uploadControllerRef.current = controller;
        try {
          if (cameraRef?.current) {
            const newPhoto = await cameraRef?.current.takePictureAsync(CAMERA_SETTINGS);
            if (newPhoto) {
              const localPhoto = { url: newPhoto.uri, thumbnail: null };
              const uploadedPhoto = userId
                ? ((
                    await uploadActivityMediaBatch(
                      [
                        {
                          fileSrc: newPhoto.uri,
                          metadata: {
                            fileName: `camera-${Date.now()}.jpg`,
                            mimeType: 'image/jpeg',
                            mediaType: 'image',
                          },
                          mediaId: String(uuid.v4()),
                        },
                      ],
                      { onProgress: setUploadProgress, signal: controller.signal },
                    )
                  ).find((photo): photo is NonNullable<typeof photo> => photo !== null) ?? null)
                : localPhoto;

              if (controller.signal.aborted) return;
              if (uploadedPhoto) {
                let mediaToAdd = uploadedPhoto;
                if (activityId && userId) {
                  try {
                    const response = await appendActivityMedia({ id: activityId, media: [uploadedPhoto] }).unwrap();
                    const [persistedPhoto] = response.media;
                    if (!persistedPhoto) throw new Error('Не удалось сохранить фото активности');
                    mediaToAdd = persistedPhoto;
                  } catch (error) {
                    await deleteUploadedMedia(
                      [uploadedPhoto.url, uploadedPhoto.thumbnail].filter((photo): photo is string => !!photo),
                    );
                    throw error;
                  }
                }
                setPhotos([...photos, mediaToAdd]);
                if (userId) dispatch(addPhotoUrl(mediaToAdd));
              }
              if (!controller.signal.aborted && saveCameraPhotosToGallery) {
                await MediaLibrary.Asset.create(newPhoto.uri);
              }
            }
          }
        } catch (error) {
          if (!controller.signal.aborted) errorToast('', error);
        } finally {
          if (uploadControllerRef.current === controller) uploadControllerRef.current = null;
          setIsLoading(false);
          setUploadProgress(0);
        }
      }}>
      {isLoading ? (
        <UploadProgress progress={uploadProgress} size={64} testID="camera-upload-progress" iconColor="#fff" />
      ) : (
        <View style={styles.shutterRing}>
          <View style={[styles.shutterCore, { backgroundColor: colors.primary }]} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shutter: { alignItems: 'center', height: 76, justifyContent: 'center', width: 76 },
  shutterRing: {
    alignItems: 'center',
    borderColor: '#fff',
    borderRadius: 38,
    borderWidth: 4,
    height: 70,
    justifyContent: 'center',
    width: 70,
  },
  shutterCore: { borderRadius: 27, height: 54, width: 54 },
  loading: { opacity: 0.8 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.94 }] },
});
