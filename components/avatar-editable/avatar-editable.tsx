import { useContext } from 'react';
import { Pressable, Image } from 'react-native';
import { Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

import { useAuth } from '../../auth/context/auth-context';
import { getSignedUrl } from '../../auth/supabase/storage/upload-photo';
import { EXPIRED_TIME } from '../../constants/const';
import { SaveSettingsContext } from '../../utils/context/settings';
import { errorHandler } from '../../utils/error-handler';
import { compressAndSendPhoto, getAccessToGallery } from '../../utils/file-sending';

export default function AvatarIconEditable() {
  const { image, setImage, isDisabled, setPhotoUrl, setIsDisabled } = useContext(SaveSettingsContext);
  const { user } = useAuth();
  const { isDisabledWhileSendingProfile } = useSelector(({ profile }) => profile);
  return (
    <Pressable
      testID="avatarEditableButton"
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
        <Avatar.Image
          size={100}
          source={() => <Icon name="person" size={64} />}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      )}
      {image && <Image source={{ uri: image }} style={{ width: 150, height: 150, borderRadius: 70 }} />}
    </Pressable>
  );
}
