export type MediaReviewStatus = 'queued' | 'processing' | 'review_required' | 'approved' | 'rejected' | 'failed' | null;

export interface MediaModerationPlaceholderProps {
  status?: MediaReviewStatus;
  compact?: boolean;
  testID?: string;
}
