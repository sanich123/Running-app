import type { ComponentProps } from 'react';
import type { Avatar } from 'react-native-paper';
import type { ImageProps } from 'expo-image';

export interface UserAvatarProps {
  size: number;
  profilePhoto?: string | null;
  name?: string | null;
  surname?: string | null;
  placeholder?: string | null;
  style?: ComponentProps<typeof Avatar.Text>['style'];
  testID?: string;
  cachePolicy?: ImageProps['cachePolicy'];
  recyclingKey?: string | null;
  transition?: ImageProps['transition'];
}
