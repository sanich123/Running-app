import { uploadMediaWithThumbnail } from '@U/file-sending/utils';
import type { MediaSource } from '@U/file-sending';

export async function uploadActivityMedia(fileSrc: MediaSource) {
  return await uploadMediaWithThumbnail(fileSrc, { scope: 'activity' }, 'Не удалось добавить медиа к активности');
}
