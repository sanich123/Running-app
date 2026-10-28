import { useRef, useState } from 'react';
import { MaterialDesignIcons as MaterialCommunityIcons } from '@react-native-vector-icons/material-design-icons/static';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useGetUserProfileByUserIdQuery, useUpdateProfileByUserIdMutation } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import ProfileImage from '@Routes/profile/avatar/profile-avatar/profile-avatar';
import UploadProgress from '@Routes/save-activity-page/upload-progress/upload-progress';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import { compressMediaFile, getAccessToGallery, uploadMediaFile, type MediaSource } from '@U/file-sending';
import { ProfileAvatarEditorTestIds } from './const';
import { useProfileFormParams } from '../profile-settings-params';
import type { ProfileAvatarEditorProps } from './types';

export default function ProfileAvatarEditor({ isDisabled, setIsDisabled }: ProfileAvatarEditorProps) {
  const { userId } = useAppSelector(({ auth }) => auth);
  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch,
  } = useGetUserProfileByUserIdQuery(userId, {
    skip: !userId,
  });
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileByUserIdMutation();
  const { name, surname } = useProfileFormParams();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadControllerRef = useRef<AbortController | null>(null);
  const isUploading = isDisabled || isProfileLoading || isUpdatingProfile || isUploadingAvatar;

  async function uploadAvatar(image: MediaSource) {
    if (!userId) return;

    const controller = new AbortController();
    uploadControllerRef.current = controller;
    setIsUploadingAvatar(true);
    setUploadProgress(0);

    try {
      const compressedImage = await compressMediaFile(image);
      if (!compressedImage || compressedImage.isVideo || controller.signal.aborted) return;

      const uploadedImage = await uploadMediaFile(compressedImage, { scope: 'profile' }, undefined, {
        onProgress: setUploadProgress,
        signal: controller.signal,
        notifyOnError: false,
      });
      if (controller.signal.aborted) return;
      if (!uploadedImage) return errorToast('Не удалось загрузить фото профиля');

      if (!uploadedImage.assetId) {
        return errorToast('Не удалось сохранить фото профиля', 'Сервер не вернул идентификатор загрузки');
      }

      await updateProfile({
        id: userId,
        body: { profilePhotoAssetId: uploadedImage.assetId, profilePhotoBlurhash: uploadedImage.blurhash },
      }).unwrap();
      if (!controller.signal.aborted) await refetch();
    } finally {
      if (uploadControllerRef.current === controller) uploadControllerRef.current = null;
      setIsUploadingAvatar(false);
      setUploadProgress(0);
    }
  }

  return (
    <>
      {Platform.OS === 'web' ? (
        <label htmlFor="image-uploader">
          <input
            style={{ display: 'none' }}
            id="image-uploader"
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={async (e) => {
              if (userId && e.target.files) {
                const file = e.target.files[0];
                if (!file) return;
                if (file.type.startsWith('video/') || /\.(mp4|mov|avi|m4v|webm|mkv|3gp)$/i.test(file.name)) {
                  return errorToast('Нельзя использовать видео файлы для аватары');
                }
                try {
                  setIsDisabled(true);
                  await uploadAvatar(file);
                } catch (error) {
                  errorToast('', getErrorMessageFromError(error));
                } finally {
                  setIsDisabled(false);
                }
              }
            }}
          />
          <View style={styles.avatarContainer}>
            <ProfileImage
              name={name}
              surname={surname}
              profilePhoto={profile?.profilePhoto}
              profilePhotoBlurhash={profile?.profilePhotoBlurhash}
            />
            <View pointerEvents="none" testID={ProfileAvatarEditorTestIds.editIcon} style={styles.editIcon}>
              <MaterialCommunityIcons name="camera-plus-outline" size={20} color="#fff" />
            </View>
            {isUploading ? (
              <Pressable
                testID={ProfileAvatarEditorTestIds.loadingOverlay}
                onPress={() => uploadControllerRef.current?.abort()}
                style={styles.loadingOverlay}
                accessibilityRole="button"
                accessibilityLabel="Отменить загрузку фото">
                <UploadProgress
                  progress={uploadProgress}
                  size={64}
                  testID={ProfileAvatarEditorTestIds.uploadProgress}
                  iconColor="#fff"
                />
              </Pressable>
            ) : null}
          </View>
        </label>
      ) : (
        <Pressable
          testID={ProfileAvatarEditorTestIds.editButton}
          onPress={async () => {
            setIsDisabled(true);
            try {
              const result = await getAccessToGallery(['images']);
              if (result && !result.canceled) {
                const imgSrc = result.assets?.[0]?.uri;
                if (imgSrc) await uploadAvatar(imgSrc);
              }
            } catch (error) {
              errorToast('', getErrorMessageFromError(error));
            } finally {
              setIsDisabled(false);
            }
          }}
          disabled={isUploading}
          style={({ pressed }) => ({ opacity: pressed || isUploading ? 0.5 : 1 })}>
          <View style={styles.avatarContainer}>
            <ProfileImage
              name={name}
              surname={surname}
              profilePhoto={profile?.profilePhoto}
              profilePhotoBlurhash={profile?.profilePhotoBlurhash}
            />
            <View pointerEvents="none" testID={ProfileAvatarEditorTestIds.editIcon} style={styles.editIcon}>
              <MaterialCommunityIcons name="camera-plus-outline" size={20} color="#fff" />
            </View>
            {isUploading ? (
              <Pressable
                testID={ProfileAvatarEditorTestIds.loadingOverlay}
                onPress={() => uploadControllerRef.current?.abort()}
                style={styles.loadingOverlay}
                accessibilityRole="button"
                accessibilityLabel="Отменить загрузку фото">
                <UploadProgress
                  progress={uploadProgress}
                  size={64}
                  testID={ProfileAvatarEditorTestIds.uploadProgress}
                  iconColor="#fff"
                />
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 75,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  editIcon: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    borderColor: '#fff',
    borderWidth: 1,
  },
});
