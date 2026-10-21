import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import CustomImage from '@S/custom-image/custom-image';
import type { NotificationActorAvatarProps } from './types';

export default function NotificationActorAvatar({ photo, label, testID }: NotificationActorAvatarProps) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  if (!photo || imageLoadFailed) return <Avatar.Text testID={testID} size={48} label={label} />;

  return (
    <Avatar.Image
      size={48}
      source={() => (
        <CustomImage
          style={styles.image}
          source={{ uri: photo }}
          contentFit="cover"
          testID={testID}
          onError={() => setImageLoadFailed(true)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({ image: { borderRadius: 24, height: 48, width: 48 } });
