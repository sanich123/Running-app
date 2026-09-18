import { uploadMediaBatchWithThumbnails, uploadMediaWithThumbnail } from '@U/file-sending/utils';
import type { MediaSource, MediaSourceMetadata, MediaUploadItem } from '@U/file-sending';

export async function uploadFeedbackAttachment(
  fileSrc: MediaSource,
  feedbackId: string,
  metadata: MediaSourceMetadata = {},
) {
  return await uploadMediaWithThumbnail(
    fileSrc,
    { scope: 'feedback', feedbackId },
    'Не удалось загрузить вложение feedback',
    metadata,
  );
}

export async function uploadFeedbackAttachments(mediaItems: readonly MediaUploadItem[], feedbackId: string) {
  return await uploadMediaBatchWithThumbnails(
    mediaItems,
    { scope: 'feedback', feedbackId },
    'Не удалось загрузить вложения feedback',
  );
}
