import type { ProfileType } from '@S/card/types';
import type { ImageProps } from 'expo-image';

export interface UserProfileAvatarProps {
  size: number;
  id: string;
  focused?: boolean;
  profile?: ProfileType;
  testID?: string;
  cachePolicy?: ImageProps['cachePolicy'];
  recyclingKey?: string | null;
  transition?: ImageProps['transition'];
}
