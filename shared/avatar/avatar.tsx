import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Avatar } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import CustomImage from '@S/custom-image/custom-image';
import type { ImageProps } from 'expo-image';

interface UserAvatarProps {
  size: number;
  profilePhoto?: string | null;
  name?: string | null;
  surname?: string | null;
  placeholder?: string | null;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  cachePolicy?: ImageProps['cachePolicy'];
  recyclingKey?: string | null;
  transition?: ImageProps['transition'];
}

export function getAvatarLabel(name?: string | null, surname?: string | null) {
  return [name, surname]
    .map((value) => value?.trim().charAt(0))
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

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

  const shouldUseCustomImage = Boolean(placeholder || cachePolicy || recyclingKey || transition !== undefined);
  if (shouldUseCustomImage) {
    return (
      <Avatar.Image
        size={size}
        style={style}
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
});
