import type { StyleProp, ViewStyle } from 'react-native';
import type { MediaReviewStatus } from '@S/media-moderation-placeholder/types';

export interface GroupPhotoModerationState {
  photoUrl?: string | null;
  photoPreviewUrl?: string | null;
  photoBlurhash?: string | null;
  photoReviewStatus?: MediaReviewStatus;
  photoPending?: boolean;
}

export interface GroupPhotoProps extends GroupPhotoModerationState {
  isOwner?: boolean;
  fallbackIcon?: string;
  iconSize?: number;
  style: StyleProp<ViewStyle>;
  testID?: string;
}
