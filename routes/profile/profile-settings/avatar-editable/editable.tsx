import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { savePhotoUrl } from '@R/slices/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ProfileImage from '@Routes/profile/avatar/avatar';
import { errorToast } from '@S/error-toast/error-toast';
import { getAccessToGallery, compressAndSendFile } from '@U/file-sending';
import { AvatarEditableTestIds } from './const';
import type { AvatarIconEditableProps } from './const';

export default function AvatarIconEditable({ isDisabled, setIsDisabled }: AvatarIconEditableProps) {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const isUploading = isDisabled || isDisabledWhileSendingProfile;

  const avatar = (
    <View style={styles.avatarContainer}>
      <ProfileImage />
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
                if (/mp4|avi|m4v/.test(e.target.files[0].name)) {
                  errorToast('Нельзя использовать видео файлы для аватары');
                  return;
                }
                const imgSrc = e.target.files[0];
                try {
                  setIsDisabled(true);
                  const fileWithThumbnail = await compressAndSendFile(imgSrc, userId);
                  if (fileWithThumbnail) {
                    const { url } = fileWithThumbnail;
                    dispatch(savePhotoUrl(url));
                  }
                } catch (error) {
                  errorToast('', error);
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
                const imgSrc = result.assets[0].uri;
                if (userId) {
                  const fileWithThumbnail = await compressAndSendFile(imgSrc, userId);
                  if (fileWithThumbnail) {
                    const { url } = fileWithThumbnail;
                    dispatch(savePhotoUrl(url));
                  }
                }
              }
            } catch (error) {
              errorToast('', error);
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
});
