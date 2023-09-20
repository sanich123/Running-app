import { useContext } from 'react';
import { Pressable, Image, ToastAndroid } from 'react-native';
import { Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAuth } from '../../auth/context/auth-context';
import { getBase64CodedImage, getSignedUrl, uploadPhoto } from '../../auth/supabase/storage/upload-photo';
import { SaveSettingsContext } from '../../utils/context/settings';
import { errorHandler } from '../../utils/error-handler';
import { getAccessToGallery } from '../../utils/file-sending';

export default function AvatarIconEditable() {
  const { image, setImage, isDisabled, setPhotoUrl, setIsDisabled } = useContext(SaveSettingsContext);
  const { user } = useAuth();
  return (
    <Pressable
      onPress={async () => {
        try {
          const result = await getAccessToGallery();
          if (!result.canceled) {
            const imgSrc = result.assets[0].uri;
            setIsDisabled(true);
            setImage(imgSrc);
            const base64 = await getBase64CodedImage(imgSrc);
            const pathToPhoto = await uploadPhoto(imgSrc, user.id, base64);
            const profilePhoto = await getSignedUrl(pathToPhoto, 100000);
            ToastAndroid.show('Get url to photo!', ToastAndroid.SHORT);
            setPhotoUrl(profilePhoto);
            setIsDisabled(false);
          }
        } catch (error) {
          errorHandler(error);
          setIsDisabled(false);
        }
      }}
      disabled={isDisabled}
      style={isDisabled && { opacity: 0.5 }}>
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
