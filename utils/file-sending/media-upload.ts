import { Platform } from 'react-native';
import {
  photosApi,
  type MediaUploadManifestEntry,
  type UploadedPhotoBatchResponse,
  type UploadedPhotoResponse,
} from '@R/services/photos/photos';
import { store } from '@R/store';
import { errorToast } from '@S/error-toast/error-toast';
import { FILE_SENDING_ERROR_COPY } from './const';
import { createMediaUploadBatchFormData, createMediaUploadFormData } from './file-utils';
import type { CompressedMediaFile, MediaUploadControl, MediaUploadOptions } from './file-sending-types';

export type UploadMediaRequest = (body: FormData, control?: MediaUploadControl) => Promise<UploadedPhotoResponse>;
export type UploadMediaBatchRequest = (
  body: FormData,
  control?: MediaUploadControl,
) => Promise<UploadedPhotoBatchResponse[]>;

export async function uploadMediaFile(
  compressedFile: CompressedMediaFile,
  uploadOptions: MediaUploadOptions = { scope: 'activity' },
  uploadRequest: UploadMediaRequest = uploadMediaToServer,
  control?: MediaUploadControl,
): Promise<UploadedPhotoResponse | null> {
  try {
    const uploadFile = await prepareMediaSourceForWeb(compressedFile);
    const formData = createMediaUploadFormData({
      file: uploadFile.file,
      originalName: uploadFile.originalName,
      extension: uploadFile.extension,
      isVideo: uploadFile.isVideo,
      mimeType: uploadFile.mimeType,
      uploadOptions,
    });
    return (await uploadRequest(formData, control)) ?? null;
  } catch (error) {
    if (!control?.signal?.aborted && control?.notifyOnError !== false) {
      errorToast(FILE_SENDING_ERROR_COPY.uploadFailed, error);
    }
    return null;
  }
}

export async function uploadMediaFiles(
  compressedFiles: CompressedMediaFile[],
  uploadOptions: MediaUploadOptions = { scope: 'activity' },
  manifest: readonly MediaUploadManifestEntry[] = compressedFiles.map((_, index) => ({
    mediaId: `media-${index}`,
    role: 'media',
  })),
  uploadRequest: UploadMediaBatchRequest = uploadMediaFilesToServer,
  control?: MediaUploadControl,
): Promise<UploadedPhotoBatchResponse[] | null> {
  if (!compressedFiles.length) return [];

  try {
    const uploadFiles = await Promise.all(compressedFiles.map(prepareMediaSourceForWeb));
    const formData = createMediaUploadBatchFormData({
      files: uploadFiles,
      uploadOptions,
      manifest,
    });
    return (await uploadRequest(formData, control)) ?? null;
  } catch (error) {
    if (!control?.signal?.aborted) errorToast(FILE_SENDING_ERROR_COPY.uploadsFailed, error);
    return null;
  }
}

async function prepareMediaSourceForWeb(mediaFile: CompressedMediaFile): Promise<CompressedMediaFile> {
  if (Platform.OS !== 'web' || typeof mediaFile.file !== 'string') return mediaFile;

  const response = await fetch(mediaFile.file);
  if (!response.ok) throw new Error('Не удалось прочитать выбранный файл');
  const blob = await response.blob();
  const type = mediaFile.mimeType || blob.type || 'application/octet-stream';
  const name = mediaFile.originalName || `runich.${mediaFile.extension || 'bin'}`;
  return { ...mediaFile, file: new File([blob], name, { type }) };
}

export async function deleteUploadedMedia(publicUrls: string[], assetIds: string[] = [], feedbackId?: string) {
  try {
    for (const assetId of assetIds) {
      await store.dispatch(photosApi.endpoints.deleteModerationUpload.initiate({ assetId })).unwrap();
    }
    for (const url of publicUrls) {
      await store
        .dispatch(photosApi.endpoints.deletePhoto.initiate({ url, ...(feedbackId ? { feedbackId } : {}) }))
        .unwrap();
    }
    return true;
  } catch (error) {
    errorToast('Не удалось удалить медиафайл', error);
    return false;
  }
}

async function uploadMediaToServer(body: FormData, control?: MediaUploadControl) {
  const request = store.dispatch(photosApi.endpoints.uploadPhoto.initiate({ body, onProgress: control?.onProgress }));
  return await awaitUploadRequest(request, control);
}

async function uploadMediaFilesToServer(body: FormData, control?: MediaUploadControl) {
  const request = store.dispatch(photosApi.endpoints.uploadPhotos.initiate({ body, onProgress: control?.onProgress }));
  return await awaitUploadRequest(request, control);
}

async function awaitUploadRequest<TResult>(
  request: { unwrap: () => Promise<TResult>; abort: () => void },
  control?: MediaUploadControl,
): Promise<TResult> {
  const abortRequest = () => request.abort();
  if (control?.signal) {
    if (control.signal.aborted) request.abort();
    else control.signal.addEventListener('abort', abortRequest, { once: true });
  }

  try {
    return await request.unwrap();
  } finally {
    control?.signal?.removeEventListener('abort', abortRequest);
  }
}
