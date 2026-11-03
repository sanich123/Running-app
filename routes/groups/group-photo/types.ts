import type { StyleProp, ViewStyle } from 'react-native';
import type { MediaReviewStatus } from '@S/media-moderation-placeholder/types';

export interface GroupPhotoProps {
  photoUrl?: string | null;
  photoPreviewUrl?: string | null;
  photoBlurhash?: string | null;
  photoReviewStatus?: MediaReviewStatus;
  photoPending?: boolean;
  fallbackIcon?: string;
  iconSize?: number;
  style: StyleProp<ViewStyle>;
  testID?: string;
}
