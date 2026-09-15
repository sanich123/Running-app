import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useGetUserProfileByUserIdQuery, useUpdateProfileByUserIdMutation } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import ProfileImage from '@Routes/profile/avatar/avatar';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import { getAccessToGallery, compressAndSendFile } from '@U/file-sending';
import { useProfileFormParams } from '../profile-settings-params';
import { AvatarEditableTestIds } from './const';
import type { AvatarIconEditableProps } from './const';

export default function AvatarIconEditable({ isDisabled, setIsDisabled }: AvatarIconEditableProps) {
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
  const isUploading = isDisabled || isProfileLoading || isUpdatingProfile;

  async function uploadAvatar(image: Parameters<typeof compressAndSendFile>[0]) {
    if (!userId) return;

    const fileWithThumbnail = await compressAndSendFile(image, userId);
    if (!fileWithThumbnail) return;

    const { url } = fileWithThumbnail;
    await updateProfile({ id: userId, body: { profilePhoto: url } }).unwrap();
    await refetch();
  }

  const avatar = (
    <View style={styles.avatarContainer}>
      <ProfileImage name={name} surname={surname} profilePhoto={profile?.profilePhoto} />
      <View pointerEvents="none" testID={AvatarEditableTestIds.editIcon} style={styles.editIcon}>
        <MaterialCommunityIcons name="camera-plus-outline" size={20} color="#fff" />
      </View>
      {isUploading ? (
        <View testID={AvatarEditableTestIds.loading} style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : null}
    </View>
  );

  return (
    <>
      {Platform.OS === 'web' ? (
        <label htmlFor="image-uploader">
          <input
            style={{ display: 'none' }}
            id="image-uploader"
            type="file"
            disabled={isUploading}
            onChange={async (e) => {
              if (userId && e.target.files) {
                const file = e.target.files[0];
                if (!file) return;
                if (/mp4|avi|m4v/.test(file.name)) {
                  errorToast('Нельзя использовать видео файлы для аватары');
                  return;
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
          {avatar}
        </label>
      ) : (
        <Pressable
          testID={AvatarEditableTestIds.editBtn}
          onPress={async () => {
            setIsDisabled(true);
            try {
              const result = await getAccessToGallery();
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
          {avatar}
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
