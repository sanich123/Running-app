import type { MEDIA_REVIEW_STATUSES } from './const';

export type MediaReviewStatus = (typeof MEDIA_REVIEW_STATUSES)[keyof typeof MEDIA_REVIEW_STATUSES] | null;

export interface MediaModerationPlaceholderProps {
  status?: MediaReviewStatus;
  blurhash?: string | null;
  borderRadius?: number;
  compact?: boolean;
  hideTitle?: boolean;
  showStatus?: boolean;
  overlay?: boolean;
  overlayIconSize?: number;
  topOffset?: number;
  testID?: string;
}
