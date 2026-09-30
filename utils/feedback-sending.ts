import { uploadMediaBatchWithThumbnails } from '@U/file-sending/utils';
import type { MediaUploadItem } from '@U/file-sending';

export async function uploadFeedbackAttachments(mediaItems: readonly MediaUploadItem[], feedbackId: string) {
  return await uploadMediaBatchWithThumbnails(
    mediaItems,
    { scope: 'feedback', feedbackId },
    'Не удалось загрузить вложения feedback',
  );
}
