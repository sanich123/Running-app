import { fetch as getNetworkState } from '@react-native-community/netinfo';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Image as ImageCompressor, Video as VideoCompressor, getVideoMetaData } from 'react-native-compressor';
import { Platform } from 'react-native';
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
  UploadedMedia,
} from './file-sending/file-sending-types';

export type UploadMediaRequest = (body: FormData, control?: MediaUploadControl) => Promise<UploadedPhotoResponse>;
export type UploadMediaBatchRequest = (
  body: FormData,
  control?: MediaUploadControl,
) => Promise<UploadedPhotoBatchResponse[]>;

export async function compressMediaFile(
  fileSrc: MediaSource,
  metadata: MediaSourceMetadata = {},
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
    const compressedFile = isVideo ? await compressVideo(fileSrc) : await compressImage(fileSrc);
    if (!compressedFile) return null;

    return {
      file: compressedFile,
      originalName: fileName,
      extension,
      isVideo,
      mimeType,
    };
  } catch (error) {
    errorToast(isVideo ? 'Ошибка во время сжатия видео' : 'Ошибка во время сжатия изображения', error);
    return null;
  }
}

export async function uploadMediaFile(
  compressedFile: CompressedMediaFile,
  uploadOptions: MediaUploadOptions = { scope: 'activity' },
  uploadRequest: UploadMediaRequest = uploadMediaToServer,
  control?: MediaUploadControl,
): Promise<UploadedPhotoResponse | null> {
  try {
    await ensureNetworkConnection(control);
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
    if (!control?.signal?.aborted) errorToast('Не удалось загрузить медиафайл', error);
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
    await ensureNetworkConnection(control);
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

export async function createVideoThumbnail(videoUrl: string): Promise<string | null> {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUrl);
    return uri;
  } catch (error) {
    errorToast('Не удалось создать превью видео', error);
    return null;
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
      quality: 0.9,
      videoMaxDuration: mediaTypes.includes('videos') ? MAX_VIDEO_DURATION_SECONDS : undefined,
      ...options,
    });
  } catch (error) {
    errorToast('Не удалось открыть галерею', error);
  }
}

export async function deleteUploadedMedia(publicUrls: string[]) {
  try {
    for (const url of publicUrls) {
      await store.dispatch(photosApi.endpoints.deletePhoto.initiate({ url })).unwrap();
    }
    return true;
  } catch (error) {
    errorToast('Не удалось удалить медиафайл', error);
    return false;
  }
}

async function compressVideo(fileSrc: MediaSource): Promise<MediaSource | null> {
  if (Platform.OS === 'web') {
    const videoInfo = await getWebVideoInfo(fileSrc);
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

    return fileSrc;
  }

  const sourceMetadata = await getVideoMetaData(String(fileSrc));
  if (!Number.isFinite(sourceMetadata.duration)) {
    errorToast('Не удалось определить длительность видео');
    return null;
  }
  if (sourceMetadata.duration > MAX_VIDEO_DURATION_SECONDS) {
    errorToast('Длительность видео должна быть не более 1 минуты');
    return null;
  }

  const compressedFile = await VideoCompressor.compress(String(fileSrc));
  if (!compressedFile) return null;

  const compressedMetadata = await getVideoMetaData(String(compressedFile));
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

async function ensureNetworkConnection(control?: MediaUploadControl) {
  if (control?.signal?.aborted) return;

  let networkState: Awaited<ReturnType<typeof getNetworkState>> | null = null;
  try {
    networkState = await getNetworkState();
  } catch {
    return;
  }
  if (networkState?.isConnected === false || networkState?.isInternetReachable === false) {
    errorToast('Отсутствует соединение с Интернет. Попытка загрузки будет продолжена.');
  }
}
