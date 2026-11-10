import type { GroupPhotoModerationState } from './types';

export function isGroupPhotoUnderModeration({
  photoUrl,
  photoPreviewUrl,
  photoBlurhash,
  photoReviewStatus,
  photoPending,
}: GroupPhotoModerationState): boolean {
  const isReviewPending = ['queued', 'processing', 'review_required'].includes(photoReviewStatus ?? '');
  const isAwaitingPublication = photoReviewStatus === 'approved' && !photoUrl && !photoPreviewUrl;
  const hasPendingBlurhash = photoPending === undefined && !photoUrl && Boolean(photoBlurhash);

  return (
    (photoPending === true && photoReviewStatus !== 'approved') ||
    isReviewPending ||
    isAwaitingPublication ||
    hasPendingBlurhash
  );
}
