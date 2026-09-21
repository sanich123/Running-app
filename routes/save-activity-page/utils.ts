import { uploadMediaBatchWithThumbnails, uploadMediaWithThumbnail } from '@U/file-sending/utils';
import type { MediaSource, MediaSourceMetadata, MediaUploadControl, MediaUploadItem } from '@U/file-sending';

export async function uploadActivityMedia(fileSrc: MediaSource, metadata: MediaSourceMetadata = {}) {
  return await uploadMediaWithThumbnail(
    fileSrc,
    { scope: 'activity' },
    'Не удалось добавить медиа к активности',
    metadata,
  );
}

export async function uploadActivityMediaBatch(mediaItems: readonly MediaUploadItem[], control?: MediaUploadControl) {
  return await uploadMediaBatchWithThumbnails(
    mediaItems,
    { scope: 'activity' },
    'Не удалось добавить медиа к активности',
    control,
  );
}
