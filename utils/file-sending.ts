import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Image as ImageCompressor, Video as VideoCompressor, getVideoMetaData } from 'react-native-compressor';
import { Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import {
  photosApi,
  type MediaUploadManifestEntry,
  type UploadedPhotoBatchResponse,
  type UploadedPhotoResponse,
} from '@R/services/photos/photos';
import { store } from '@R/store';
import { errorToast } from '@S/error-toast/error-toast';
import {
  MAX_MEDIA_FILE_SIZE,
  MAX_VIDEO_DURATION_SECONDS,
  createMediaUploadBatchFormData,
  createMediaUploadFormData,
  getMediaFileInfo,
  SUPPORTED_VIDEO_FILE_EXTENSIONS,
  SUPPORTED_VIDEO_MIME_TYPES,
  isSupportedImageExtension,
} from './file-sending/file-utils';
import type {
  CompressedMediaFile,
  MediaSource,
  MediaSourceMetadata,
  MediaUploadControl,
  MediaUploadOptions,
} from './file-sending/file-sending-types';

export type {
  CompressedMediaFile,
  MediaSource,
  MediaSourceMetadata,
  MediaUploadControl,
  MediaUploadItem,
  MediaUploadOptions,
  MediaUploadPhase,
  UploadedMedia,
} from './file-sending/file-sending-types';

export type UploadMediaRequest = (body: FormData, control?: MediaUploadControl) => Promise<UploadedPhotoResponse>;
export type UploadMediaBatchRequest = (
  body: FormData,
  control?: MediaUploadControl,
) => Promise<UploadedPhotoBatchResponse[]>;

export async function waitForMediaUploadReview<T extends UploadedPhotoResponse>(
  uploads: T[],
  control?: MediaUploadControl,
): Promise<T[]> {
  const assetIds = uploads.flatMap(({ assetId, status, url }) =>
    assetId && !url && status && ['queued', 'processing'].includes(status) ? [assetId] : [],
  );
  if (!assetIds.length) return uploads;

  const results = new Map<string, T>();
  uploads.forEach((upload) => {
    if (upload.assetId) results.set(upload.assetId, upload as T);
  });
  let pendingIds = assetIds;
  let notifiedForReview = false;

  for (let attempt = 0; pendingIds.length && attempt < 180; attempt += 1) {
    if (control?.signal?.aborted) throw new Error('Загрузка медиафайлов отменена');
    const request = store.dispatch(
      photosApi.endpoints.getMediaUploadStatuses.initiate({ ids: pendingIds }, { forceRefetch: true }),
    );
    try {
      const response = await request.unwrap();
      response.items.forEach((status) => {
        const previous = results.get(status.assetId);
        if (!previous) return;
        results.set(status.assetId, { ...previous, ...status });
      });
      if (!notifiedForReview && response.items.some(({ status }) => status === 'review_required')) {
        notifiedForReview = true;
        const isRussian = store.getState().settings.language === LANGUAGES.russian;
        errorToast(
          isRussian
            ? 'Медиа отправлено модератору. Загрузка продолжится после проверки'
            : 'Media sent to moderation. Upload will continue after review',
        );
      }
      const approvedButUnpublished = response.items.filter(({ status, url }) => status === 'approved' && !url);
      await Promise.all(
        approvedButUnpublished.map(async ({ assetId }) => {
          const publish = store.dispatch(photosApi.endpoints.publishApprovedMediaUpload.initiate({ assetId }));
          try {
            const result = await publish.unwrap();
            const previous = results.get(assetId);
            if (previous) results.set(assetId, { ...previous, status: 'approved', ...result });
          } finally {
            publish.reset();
          }
        }),
      );
    } finally {
      request.unsubscribe();
    }

    pendingIds = pendingIds.filter((assetId) => {
      const status = results.get(assetId)?.status;
      return status === 'queued' || status === 'processing' || status === 'review_required';
    });
    if (pendingIds.some((assetId) => results.get(assetId)?.status === 'review_required')) {
      control?.onProgress?.(0.95);
    }
    if (pendingIds.length) await new Promise((resolve) => setTimeout(resolve, 5_000));
  }

  if (pendingIds.length) throw new Error('Проверка медиа занимает больше времени. Файл пока недоступен.');
  return uploads.map((upload) => (upload.assetId ? (results.get(upload.assetId) ?? upload) : upload));
}

const VIDEO_MAX_SIZE = 720;

export async function compressMediaFile(
  fileSrc: MediaSource,
  metadata: MediaSourceMetadata = {},
  control?: MediaUploadControl,
): Promise<CompressedMediaFile | null> {
  const { fileName, extension, isVideo, mimeType } = getMediaFileInfo(fileSrc, metadata);

  if (isVideo && !isSupportedVideoFormat(extension, mimeType)) {
    errorToast('Поддерживаются только видео MP4, MOV и WebM');
    return null;
  }

  if (!isVideo && !mimeType.startsWith('image/') && !isSupportedImageExtension(extension)) {
    errorToast('Такое разрешение нельзя использовать для изображения');
    return null;
  }

  try {
    if (control?.signal?.aborted) return null;
    const compression = (isVideo ? compressVideo(fileSrc, control) : compressImage(fileSrc)).catch((error: unknown) => {
      if (!control?.signal?.aborted) {
        errorToast(isVideo ? 'Ошибка во время сжатия видео' : 'Ошибка во время сжатия изображения', error);
      }
      return null;
    });
    const compressedFile = await waitForCompressionOrAbort(compression, control?.signal);
    if (control?.signal?.aborted) return null;
    if (!compressedFile) return null;
    control?.onStatusProgress?.('compressing', 1);

    return {
      file: compressedFile,
      originalName: fileName,
      extension,
      isVideo,
      mimeType,
    };
  } catch (error) {
    if (!control?.signal?.aborted) {
      errorToast(isVideo ? 'Ошибка во время сжатия видео' : 'Ошибка во время сжатия изображения', error);
    }
    return null;
  }
}

function waitForCompressionOrAbort<T>(compression: Promise<T | null>, signal?: AbortSignal): Promise<T | null> {
  if (!signal) return compression;
  if (signal.aborted) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const handleAbort = () => {
      signal.removeEventListener('abort', handleAbort);
      resolve(null);
    };

    signal.addEventListener('abort', handleAbort, { once: true });
    compression.then(
      (value) => {
        signal.removeEventListener('abort', handleAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener('abort', handleAbort);
        reject(error);
      },
    );
  });
}

export async function uploadMediaFile(
  compressedFile: CompressedMediaFile,
  uploadOptions: MediaUploadOptions = { scope: 'activity' },
  uploadRequest: UploadMediaRequest = uploadMediaToServer,
  control?: MediaUploadControl,
): Promise<UploadedPhotoResponse | null> {
  try {
    const formData = createMediaUploadFormData({
      file: compressedFile.file,
      originalName: compressedFile.originalName,
      extension: compressedFile.extension,
      isVideo: compressedFile.isVideo,
      mimeType: compressedFile.mimeType,
      uploadOptions,
    });
    return (await uploadRequest(formData, control)) ?? null;
  } catch (error) {
    if (!control?.signal?.aborted && control?.notifyOnError !== false) {
      errorToast('Не удалось загрузить медиафайл', error);
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
    const formData = createMediaUploadBatchFormData({
      files: compressedFiles,
      uploadOptions,
      manifest,
    });
    return (await uploadRequest(formData, control)) ?? null;
  } catch (error) {
    if (!control?.signal?.aborted) errorToast('Не удалось загрузить медиафайлы', error);
    return null;
  }
}

export async function createVideoThumbnail(videoSource: MediaSource): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  let objectUrl: string | null = null;
  try {
    if (typeof videoSource !== 'string') objectUrl = URL.createObjectURL(videoSource);
    const { uri } = await VideoThumbnails.getThumbnailAsync(objectUrl ?? (videoSource as string));
    return uri;
  } catch {
    return null;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

export async function getAccessToGallery(
  mediaTypes: ImagePicker.MediaType[] = ['images', 'videos'],
  options: Pick<ImagePicker.ImagePickerOptions, 'allowsMultipleSelection' | 'selectionLimit' | 'videoMaxDuration'> = {},
) {
  try {
    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      aspect: [4, 3],
      quality: 1,
      videoMaxDuration: mediaTypes.includes('videos') ? MAX_VIDEO_DURATION_SECONDS : undefined,
      ...options,
    });
  } catch (error) {
    errorToast('Не удалось открыть галерею', error);
  }
}

export async function deleteUploadedMedia(publicUrls: string[], assetIds: string[] = []) {
  try {
    for (const assetId of assetIds) {
      await store.dispatch(photosApi.endpoints.deleteModerationUpload.initiate({ assetId })).unwrap();
    }
    for (const url of publicUrls) {
      await store.dispatch(photosApi.endpoints.deletePhoto.initiate({ url })).unwrap();
    }
    return true;
  } catch (error) {
    errorToast('Не удалось удалить медиафайл', error);
    return false;
  }
}

async function compressVideo(fileSrc: MediaSource, control?: MediaUploadControl): Promise<MediaSource | null> {
  if (Platform.OS === 'web') {
    const videoInfo = await getWebVideoInfo(fileSrc);
    if (control?.signal?.aborted) return null;
    if (!Number.isFinite(videoInfo.duration)) {
      errorToast('Не удалось определить длительность видео');
      return null;
    }
    if (videoInfo.duration > MAX_VIDEO_DURATION_SECONDS) {
      errorToast('Длительность видео должна быть не более 1 минуты');
      return null;
    }
    if (videoInfo.size > MAX_MEDIA_FILE_SIZE) {
      errorToast('Размер видео должен быть не более 50 МБ');
      return null;
    }

    control?.onStatusProgress?.('compressing', 1);
    return fileSrc;
  }

  const sourceMetadata = await getVideoMetaData(String(fileSrc));
  if (control?.signal?.aborted) return null;
  if (!Number.isFinite(sourceMetadata.duration) || sourceMetadata.duration <= 0) {
    errorToast('Не удалось определить длительность видео');
    return null;
  }
  if (sourceMetadata.duration > MAX_VIDEO_DURATION_SECONDS) {
    errorToast('Длительность видео должна быть не более 1 минуты');
    return null;
  }

  if (control?.signal?.aborted) return null;
  let cancellationId: string | undefined;
  const cancelCompression = () => {
    if (cancellationId) VideoCompressor.cancelCompression(cancellationId);
  };
  control?.signal?.addEventListener('abort', cancelCompression, { once: true });
  if (control?.signal?.aborted) cancelCompression();

  let compressedFile: string;
  try {
    compressedFile = control
      ? await VideoCompressor.compress(
          String(fileSrc),
          {
            maxSize: VIDEO_MAX_SIZE,
            getCancellationId: (id) => {
              cancellationId = id;
              if (control.signal?.aborted) cancelCompression();
            },
          },
          (progress) => control.onStatusProgress?.('compressing', Math.max(0, Math.min(progress, 1))),
        )
      : await VideoCompressor.compress(String(fileSrc), { maxSize: VIDEO_MAX_SIZE });
  } finally {
    control?.signal?.removeEventListener('abort', cancelCompression);
  }
  if (control?.signal?.aborted) return null;
  if (!compressedFile) return null;

  const compressedMetadata = await getVideoMetaData(String(compressedFile));
  if (control?.signal?.aborted) return null;
  if (compressedMetadata.size > MAX_MEDIA_FILE_SIZE) {
    errorToast('Размер видео должен быть не более 50 МБ');
    return null;
  }

  return compressedFile;
}

async function getWebVideoInfo(fileSrc: MediaSource): Promise<{ duration: number; size: number }> {
  if (typeof document === 'undefined') throw new Error('Невозможно определить параметры видео в этом окружении');

  const file = typeof fileSrc === 'string' ? await (await fetch(fileSrc)).blob() : fileSrc;
  const url = URL.createObjectURL(file);

  return await new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    const cleanup = () => {
      video.onloadedmetadata = null;
      video.onerror = null;
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      resolve({ duration, size: file.size });
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('Не удалось прочитать метаданные видео'));
    };
    video.src = url;
  });
}

function isSupportedVideoFormat(extension: string, mimeType: string) {
  return extension ? SUPPORTED_VIDEO_FILE_EXTENSIONS.has(extension) : SUPPORTED_VIDEO_MIME_TYPES.has(mimeType);
}

async function compressImage(fileSrc: MediaSource): Promise<MediaSource> {
  if (Platform.OS === 'web') return fileSrc;
  return await ImageCompressor.compress(String(fileSrc));
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
