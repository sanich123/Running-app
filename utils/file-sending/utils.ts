import { errorToast } from '@S/error-toast/error-toast';
import { compressMediaFile, createVideoThumbnail, uploadMediaFile } from '../file-sending';
import type { MediaSource, MediaSourceMetadata, MediaUploadOptions } from './file-sending-types';

export async function uploadMediaWithThumbnail(
  fileSrc: MediaSource,
  uploadOptions: MediaUploadOptions,
  errorMessage: string,
  metadata: MediaSourceMetadata = {},
) {
  try {
    const compressedFile = await compressMediaFile(fileSrc, metadata);
    if (!compressedFile) return null;

    const uploadedFile = await uploadMediaFile(compressedFile, uploadOptions);
    if (!uploadedFile) return null;

    if (!compressedFile.isVideo) return { url: uploadedFile.url, thumbnail: null };

    const thumbnailSource = await createVideoThumbnail(
      typeof compressedFile.file === 'string' ? compressedFile.file : uploadedFile.url,
    );
    if (!thumbnailSource) return { url: uploadedFile.url, thumbnail: null };

    const compressedThumbnail = await compressMediaFile(thumbnailSource);
    if (!compressedThumbnail) return { url: uploadedFile.url, thumbnail: null };

    const uploadedThumbnail = await uploadMediaFile(compressedThumbnail, uploadOptions);
    return { url: uploadedFile.url, thumbnail: uploadedThumbnail?.url ?? null };
  } catch (error) {
    errorToast(errorMessage, error);
    return null;
  }
}
