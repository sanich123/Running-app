import { StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import CustomImage from '@S/custom-image/custom-image';
import { getProductionBucketFallbackUri } from '@S/custom-image/utils';
import { getAvatarLabel } from './utils';
import type { UserAvatarProps } from './types';

export default function UserAvatar({
  size,
  profilePhoto,
  name,
  surname,
  placeholder,
  style,
  testID,
  cachePolicy,
  recyclingKey,
  transition,
}: UserAvatarProps) {
  if (!profilePhoto) {
    const label = getAvatarLabel(name, surname);

    if (label) {
      return <Avatar.Text testID={testID} size={size} label={label} labelStyle={styles.text} style={style} />;
    }

    return <Avatar.Icon testID={testID} size={size} icon="account" style={style} />;
  }

  const shouldUseCustomImage = Boolean(
    placeholder ||
    cachePolicy ||
    recyclingKey ||
    transition !== undefined ||
    getProductionBucketFallbackUri(profilePhoto),
  );
  if (shouldUseCustomImage) {
    return (
      <Avatar.Image
        size={size}
        style={[styles.imageContainer, style]}
        source={() => (
          <CustomImage
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
            source={{ uri: profilePhoto }}
            contentFit="cover"
            placeholder={placeholder}
            cachePolicy={cachePolicy}
            recyclingKey={recyclingKey}
            transition={transition}
            testID={testID}
          />
        )}
      />
    );
  }

  return <Avatar.Image testID={testID} size={size} source={{ uri: profilePhoto }} style={style} />;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: FONT_FAMILIES.regular,
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  image: {
    overflow: 'hidden',
  },
  imageContainer: {
    overflow: 'hidden',
  },
});
