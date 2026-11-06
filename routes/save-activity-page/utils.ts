import { uploadMediaBatchWithThumbnails, uploadMediaWithThumbnail } from '@U/file-sending/utils';
import { SAVE_ACTIVITY_MEDIA_ERROR_COPY } from './const';
import type { MediaSource, MediaSourceMetadata, MediaUploadControl, MediaUploadItem } from '@U/file-sending';

export async function uploadActivityMedia(fileSrc: MediaSource, metadata: MediaSourceMetadata = {}) {
  return await uploadMediaWithThumbnail(
    fileSrc,
    { scope: 'activity' },
    SAVE_ACTIVITY_MEDIA_ERROR_COPY.addMediaFailed,
    metadata,
  );
}

export async function uploadActivityMediaBatch(mediaItems: readonly MediaUploadItem[], control?: MediaUploadControl) {
  return await uploadMediaBatchWithThumbnails(
    mediaItems,
    { scope: 'activity' },
    SAVE_ACTIVITY_MEDIA_ERROR_COPY.addMediaFailed,
    control,
  );
}
