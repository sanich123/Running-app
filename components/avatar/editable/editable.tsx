import { useAuth } from '@A/context/auth-context';
import ProfileImage from '@C/profile/avatar/avatar';
import { savePhotoUrl } from '@R/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorHandler } from '@U/error-handler';
import { getAccessToGallery, compressAndSendFile } from '@U/file-sending';
import { Platform, Pressable } from 'react-native';
import { useToast } from 'react-native-toast-notifications';

import { AvatarIconEditableProps, AvatarEditableTestIds } from './const';

export default function AvatarIconEditable({ isDisabled, setIsDisabled }: AvatarIconEditableProps) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const toast = useToast();

  return (
    <>
      {Platform.OS === 'web' ? (
        <label htmlFor="image-uploader">
          <input
            style={{ display: 'none' }}
            id="image-uploader"
            type="file"
            onChange={async (e) => {
              if (user && e.target.files) {
                if (/mp4|avi|m4v/.test(e.target.files[0].name)) {
                  toast.show('Нельзя использовать видео файлы для аватары');
                  return;
                }
                const imgSrc = e.target.files[0];
                try {
                  setIsDisabled(true);
                  const fileWithThumbnail = await compressAndSendFile(imgSrc, user.id);
                  if (fileWithThumbnail) {
                    const { url } = fileWithThumbnail;
                    dispatch(savePhotoUrl(url));
                  }
                } catch (error) {
                  errorHandler(error);
                } finally {
                  setIsDisabled(false);
                }
              }
            }}
          />
          <ProfileImage />
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
                if (user) {
                  const fileWithThumbnail = await compressAndSendFile(imgSrc, user.id);
                  if (fileWithThumbnail) {
                    const { url } = fileWithThumbnail;
                    dispatch(savePhotoUrl(url));
                  }
                }
              }
            } catch (error) {
              errorHandler(error);
            } finally {
              setIsDisabled(false);
            }
          }}
          disabled={isDisabled || isDisabledWhileSendingProfile}
          style={({ pressed }) => ({ opacity: pressed || isDisabled || isDisabledWhileSendingProfile ? 0.5 : 1 })}>
          <ProfileImage />
        </Pressable>
      )}
    </>
  );
}
