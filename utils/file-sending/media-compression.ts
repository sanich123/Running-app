import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { createVideoPlayer } from 'expo-video';
import { Image as ImageCompressor, Video as VideoCompressor, getVideoMetaData } from 'react-native-compressor';
import { Platform } from 'react-native';
import { errorToast } from '@S/error-toast/error-toast';
import { FILE_SENDING_ERROR_COPY } from './const';
import {
  MAX_MEDIA_FILE_SIZE,
  MAX_VIDEO_DURATION_SECONDS,
  getMediaFileInfo,
  SUPPORTED_VIDEO_FILE_EXTENSIONS,
  SUPPORTED_VIDEO_MIME_TYPES,
  isSupportedImageExtension,
} from './file-utils';
import type { CompressedMediaFile, MediaSource, MediaSourceMetadata, MediaUploadControl } from './file-sending-types';

const VIDEO_MAX_SIZE = 720;
const VIDEO_THUMBNAIL_LOAD_TIMEOUT_MS = 15_000;

export async function compressMediaFile(
  fileSrc: MediaSource,
  metadata: MediaSourceMetadata = {},
  control?: MediaUploadControl,
): Promise<CompressedMediaFile | null> {
  const { fileName, extension, isVideo, mimeType } = getMediaFileInfo(fileSrc, metadata);

  if (isVideo && !isSupportedVideoFormat(extension, mimeType)) {
    errorToast(FILE_SENDING_ERROR_COPY.invalidVideoFormat);
    return null;
  }

  if (!isVideo && !mimeType.startsWith('image/') && !isSupportedImageExtension(extension)) {
    errorToast(FILE_SENDING_ERROR_COPY.invalidImageFormat);
    return null;
  }

  try {
    if (control?.signal?.aborted) return null;
    const compression = (isVideo ? compressVideo(fileSrc, control) : compressImage(fileSrc)).catch((error: unknown) => {
      if (!control?.signal?.aborted) {
        errorToast(
          isVideo ? FILE_SENDING_ERROR_COPY.compressionFailed.video : FILE_SENDING_ERROR_COPY.compressionFailed.image,
          error,
        );
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
      errorToast(
        isVideo ? FILE_SENDING_ERROR_COPY.compressionFailed.video : FILE_SENDING_ERROR_COPY.compressionFailed.image,
        error,
      );
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

export async function createVideoThumbnail(videoSource: MediaSource): Promise<CompressedMediaFile | null> {
  if (Platform.OS === 'web' || typeof videoSource !== 'string') return null;

  try {
    const player = createVideoPlayer(null);
    try {
      await loadVideoSourceForThumbnail(player, videoSource);
      const [thumbnail] = await player.generateThumbnailsAsync([0], { maxWidth: VIDEO_MAX_SIZE });
      if (!thumbnail) return null;

      try {
        const context = ImageManipulator.manipulate(thumbnail);
        try {
          const image = await context.renderAsync();
          try {
            const { uri } = await image.saveAsync({ compress: 0.85, format: SaveFormat.WEBP });
            return {
              file: uri,
              originalName: 'thumbnail.webp',
              extension: 'webp',
              isVideo: false,
              mimeType: 'image/webp',
            };
          } finally {
            image.release();
          }
        } finally {
          context.release();
        }
      } finally {
        thumbnail.release();
      }
    } finally {
      player.release();
    }
  } catch {
    return null;
  }
}

function loadVideoSourceForThumbnail(player: ReturnType<typeof createVideoPlayer>, videoSource: string) {
  return new Promise<void>((resolve, reject) => {
    let isSettled = false;
    const subscriptions: { remove: () => void }[] = [];
    const finish = (error?: unknown) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeout);
      subscriptions.forEach(({ remove }) => remove());
      if (error) reject(error);
      else resolve();
    };
    const timeout = setTimeout(
      () => finish(new Error('Время ожидания загрузки видео для создания превью истекло')),
      VIDEO_THUMBNAIL_LOAD_TIMEOUT_MS,
    );

    subscriptions.push(player.addListener('sourceLoad', () => finish()));
    subscriptions.push(
      player.addListener('statusChange', ({ status }) => {
        if (status === 'error') finish(new Error('Видео не загрузилось для создания превью'));
      }),
    );
    if (player.status === 'readyToPlay') return finish();
    if (player.status === 'error') return finish(new Error('Видео не загрузилось для создания превью'));

    void player.replaceAsync(videoSource).catch(finish);
  });
}

async function compressVideo(fileSrc: MediaSource, control?: MediaUploadControl): Promise<MediaSource | null> {
  if (Platform.OS === 'web') {
    const videoInfo = await getWebVideoInfo(fileSrc);
    if (control?.signal?.aborted) return null;
    if (!Number.isFinite(videoInfo.duration)) {
      errorToast(FILE_SENDING_ERROR_COPY.videoDurationUnavailable);
      return null;
    }
    if (videoInfo.duration > MAX_VIDEO_DURATION_SECONDS) {
      errorToast(FILE_SENDING_ERROR_COPY.videoDurationExceeded);
      return null;
    }
    if (videoInfo.size > MAX_MEDIA_FILE_SIZE) {
      errorToast(FILE_SENDING_ERROR_COPY.videoSizeExceeded);
      return null;
    }

    control?.onStatusProgress?.('compressing', 1);
    return fileSrc;
  }

  const sourceMetadata = await getVideoMetaData(String(fileSrc));
  if (control?.signal?.aborted) return null;
  if (!Number.isFinite(sourceMetadata.duration) || sourceMetadata.duration <= 0) {
    errorToast(FILE_SENDING_ERROR_COPY.videoDurationUnavailable);
    return null;
  }
  if (sourceMetadata.duration > MAX_VIDEO_DURATION_SECONDS) {
    errorToast(FILE_SENDING_ERROR_COPY.videoDurationExceeded);
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
    errorToast(FILE_SENDING_ERROR_COPY.videoSizeExceeded);
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
