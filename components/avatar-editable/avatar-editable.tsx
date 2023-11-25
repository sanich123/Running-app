import { useAuth } from '@A/context/auth-context';
import { getSignedUrl } from '@A/supabase/storage/upload-photo';
import { AvatarShowableIcons } from '@C/avatar-showable/const';
import { useAppSelector } from '@R/typed-hooks';
import { errorHandler } from '@U/error-handler';
import { getAccessToGallery, compressAndSendPhoto } from '@U/file-sending';
import { EXPIRED_TIME } from '@const/const';
import { Pressable, Image, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';

import { AvatarIconEditableProps, AvatarEditableTestIds } from './const';

export default function AvatarIconEditable({
  image,
  setImage,
  isDisabled,
  setPhotoUrl,
  setIsDisabled,
}: AvatarIconEditableProps) {
  const { user } = useAuth();
  const { isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);

  return (
    <Pressable
      testID={AvatarEditableTestIds.editBtn}
      onPress={async () => {
        setIsDisabled(true);
        try {
          const result = await getAccessToGallery();
          if (result && !result.canceled) {
            const imgSrc = result.assets[0].uri;
            setImage(imgSrc);
            if (user) {
              const pathToPhoto = await compressAndSendPhoto(imgSrc, user.id);
              if (pathToPhoto) {
                const url = await getSignedUrl(pathToPhoto, EXPIRED_TIME);
                if (url) {
                  setPhotoUrl(url);
                }
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
      style={(isDisabled || isDisabledWhileSendingProfile) && { opacity: 0.5 }}>
      {!image && (
        <Avatar.Icon
          testID={AvatarEditableTestIds.default}
          size={150}
          icon={AvatarShowableIcons.default}
          style={styles.isInCenter}
        />
      )}
      {image && (
        <Image
          testID={AvatarEditableTestIds.successImg}
          source={{ uri: image }}
          style={{ width: 150, height: 150, borderRadius: 70 }}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  isInCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
