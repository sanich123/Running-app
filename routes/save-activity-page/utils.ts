import { uploadMediaWithThumbnail } from '@U/file-sending/utils';
import type { MediaSource, MediaSourceMetadata } from '@U/file-sending';

export async function uploadActivityMedia(fileSrc: MediaSource, metadata: MediaSourceMetadata = {}) {
  return await uploadMediaWithThumbnail(
    fileSrc,
    { scope: 'activity' },
    'Не удалось добавить медиа к активности',
    metadata,
  );
}
