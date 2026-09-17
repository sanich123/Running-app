import { uploadMediaWithThumbnail } from '@U/file-sending/utils';
import type { MediaSource } from '@U/file-sending';

export async function uploadFeedbackAttachment(fileSrc: MediaSource, feedbackId: string) {
  return await uploadMediaWithThumbnail(
    fileSrc,
    { scope: 'feedback', feedbackId },
    'Не удалось загрузить вложение feedback',
  );
}
