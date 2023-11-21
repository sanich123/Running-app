import { Pressable, Image, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { AvatarEditableTestIds, AvatarIconEditableProps } from './const';
import { useAuth } from '../../auth/context/auth-context';
import { getSignedUrl } from '../../auth/supabase/storage/upload-photo';
import { EXPIRED_TIME } from '../../constants/const';
import { errorHandler } from '../../utils/error-handler';
import { compressAndSendPhoto, getAccessToGallery } from '../../utils/file-sending';
import { AvatarShowableIcons } from '../avatar-showable/const';

export default function AvatarIconEditable({
  image,
  setImage,
  isDisabled,
  setPhotoUrl,
  setIsDisabled,
}: AvatarIconEditableProps) {
  const { user } = useAuth();
  const { isDisabledWhileSendingProfile } = useSelector(({ profile }) => profile);

  return (
    <Pressable
      testID={AvatarEditableTestIds.editBtn}
      onPress={async () => {
        setIsDisabled(true);
        try {
          const result = await getAccessToGallery();
          if (!result.canceled) {
            const imgSrc = result.assets[0].uri;
            setImage(imgSrc);
            const pathToPhoto = await compressAndSendPhoto(imgSrc, user.id);
            const url = await getSignedUrl(pathToPhoto, EXPIRED_TIME);
            setPhotoUrl(url);
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
  isInCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
});
