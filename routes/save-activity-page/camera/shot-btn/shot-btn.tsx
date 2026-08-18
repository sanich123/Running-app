import { useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { addPhotoUrl } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { compressAndSendFile } from '@U/file-sending';
import { CAMERA_SETTINGS } from '../const';
import type { ShotBtnProps } from '../types';

export default function ShotBtn({ cameraRef, setPhotos, photos }: ShotBtnProps) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector(({ auth }) => auth);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Pressable
      testID="camera-shot-button"
      accessibilityRole="button"
      accessibilityLabel="Сделать фото"
      disabled={isLoading}
      style={({ pressed }) => [styles.shutter, pressed && styles.pressed, isLoading && styles.loading]}
      onPress={async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
          if (cameraRef?.current) {
            const newPhoto = await cameraRef?.current.takePictureAsync(CAMERA_SETTINGS);
            if (newPhoto) {
              const localPhoto = { url: newPhoto.uri, thumbnail: null };
              const uploadedPhoto = userId ? await compressAndSendFile(newPhoto.uri, userId) : localPhoto;

              if (uploadedPhoto) {
                setPhotos([...photos, uploadedPhoto]);
                if (userId) dispatch(addPhotoUrl(uploadedPhoto));
              }
              await MediaLibrary.Asset.create(newPhoto.uri);
            }
          }
        } catch (error) {
          errorToast('', error);
        } finally {
          setIsLoading(false);
        }
      }}>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
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
