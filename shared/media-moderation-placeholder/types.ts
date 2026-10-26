export type MediaReviewStatus = 'queued' | 'processing' | 'review_required' | 'approved' | 'rejected' | 'failed' | null;

export interface MediaModerationPlaceholderProps {
  status?: MediaReviewStatus;
  blurhash?: string | null;
  borderRadius?: number;
  compact?: boolean;
  hideTitle?: boolean;
  showStatus?: boolean;
  overlay?: boolean;
  topOffset?: number;
  testID?: string;
}
