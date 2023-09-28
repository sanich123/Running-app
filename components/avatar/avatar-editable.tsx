import { useContext } from 'react';
import { Pressable, Image } from 'react-native';
import { Image as ImageCompressor } from 'react-native-compressor';
import { Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAuth } from '../../auth/context/auth-context';
import { getBase64CodedImage, uploadPhoto, getSignedUrl } from '../../auth/supabase/storage/upload-photo';
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
            const compressedImage = await ImageCompressor.compress(imgSrc);
            const base64 = await getBase64CodedImage(compressedImage);
            const pathToPhoto = await uploadPhoto(user.id, base64);
            const url = await getSignedUrl(pathToPhoto, 100000);
            setPhotoUrl(url);
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
