import { useContext } from 'react';
import { Pressable, Image } from 'react-native';
import { Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

import { SaveSettingsContext } from '../../utils/context/settings';
import { getAccessToGallery } from '../../utils/file-sending';

export default function AvatarIcon() {
  const { image, setImage } = useContext(SaveSettingsContext);
  return (
    <Pressable
      onPress={async () => {
        const result = await getAccessToGallery();
        if (!result.canceled) {
          const uri = result.assets[0].uri;
          setImage(uri);
        }
      }}>
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
