import { Pressable, Image } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { useAuth } from '../../auth/context/auth-context';
import { getSignedUrl } from '../../auth/supabase/storage/upload-photo';
import { EXPIRED_TIME } from '../../constants/const';
import { errorHandler } from '../../utils/error-handler';
import { compressAndSendPhoto, getAccessToGallery } from '../../utils/file-sending';

type AvatarIconEditableProps = {
  image: string;
  isDisabled: boolean;
  setImage: (arg: string) => void;
  setPhotoUrl: (arg: string) => void;
  setIsDisabled: (arg: boolean) => void;
};

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
        <Avatar.Icon
          testID="avatarShowableDefaultIcon"
          size={150}
          icon="account-circle-outline"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      )}
      {image && (
        <Image
          testID="avatarEditableImage"
          source={{ uri: image }}
          style={{ width: 150, height: 150, borderRadius: 70 }}
        />
      )}
    </Pressable>
  );
}
