import type { MediaSourceMetadata, MediaUploadOptions, MediaSource } from './file-sending-types';
import type { MediaUploadManifestEntry } from '@R/services/photos/photos';

export const MAX_VIDEO_FILE_SIZE = 50 * 1024 * 1024;
export const MAX_VIDEO_DURATION_SECONDS = 60;
export const MAX_MEDIA_FILE_SIZE = MAX_VIDEO_FILE_SIZE;
export const MAX_MEDIA_BATCH_SIZE = 100 * 1024 * 1024;
export const VIDEO_FILE_EXTENSIONS = new Set([
  '3g2',
  '3gp',
  'avi',
  'flv',
  'm2ts',
  'm4v',
  'mkv',
  'mov',
  'mp4',
  'mpeg',
  'mpg',
  'ogv',
  'ts',
  'webm',
  'wmv',
]);
export const SUPPORTED_VIDEO_FILE_EXTENSIONS = new Set(['mov', 'mp4', 'webm']);
export const SUPPORTED_VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

const IMAGE_MIME_TYPES: Record<string, string> = {
  avif: 'image/avif',
  bmp: 'image/bmp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  ico: 'image/x-icon',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  webp: 'image/webp',
};

const VIDEO_MIME_TYPES: Record<string, string> = {
  '3g2': 'video/3gpp2',
  '3gp': 'video/3gpp',
  avi: 'video/x-msvideo',
  flv: 'video/x-flv',
  m2ts: 'video/mp2t',
  m4v: 'video/x-m4v',
  mkv: 'video/x-matroska',
  mov: 'video/quicktime',
  mp4: 'video/mp4',
  mpeg: 'video/mpeg',
  mpg: 'video/mpeg',
  ogv: 'video/ogg',
  ts: 'video/mp2t',
  webm: 'video/webm',
  wmv: 'video/x-ms-wmv',
};

export function getMediaFileInfo(fileSrc: MediaSource, metadata: MediaSourceMetadata = {}) {
  const fileName = metadata.fileName || getFileName(fileSrc);
  const extension = getFileExtension(fileName);
  const detectedMimeType = metadata.mimeType || getFileMimeType(fileSrc, extension);
  const isVideo =
    metadata.mediaType === 'video' || detectedMimeType.startsWith('video/') || VIDEO_FILE_EXTENSIONS.has(extension);
  const mimeType =
    detectedMimeType === 'application/octet-stream' && metadata.mediaType
      ? isVideo
        ? 'video/mp4'
        : 'image/jpeg'
      : detectedMimeType;

  return { fileName, extension, isVideo, mimeType };
}

export function isSupportedImageExtension(extension: string) {
  return /^(avif|bmp|gif|heic|heif|ico|jpeg|jpg|png|svg|tif|tiff|webp)$/.test(extension);
}

export function createMediaUploadFormData({
  file,
  originalName,
  extension,
  isVideo,
  mimeType,
  uploadOptions,
}: {
  file: MediaSource;
  originalName: string;
  extension: string;
  isVideo: boolean;
  mimeType: string;
  uploadOptions: MediaUploadOptions;
}) {
  const formData = new FormData();
  formData.append('file', createUploadFile({ file, originalName, extension, isVideo, mimeType }) as never);
  if (uploadOptions.scope) formData.append('scope', uploadOptions.scope);
  if (uploadOptions.feedbackId) formData.append('feedbackId', uploadOptions.feedbackId);
  return formData;
}

export function createMediaUploadBatchFormData({
  files,
  uploadOptions,
  manifest,
}: {
  files: MediaUploadFile[];
  uploadOptions: MediaUploadOptions;
  manifest: readonly MediaUploadManifestEntry[];
}) {
  if (files.length !== manifest.length) throw new Error('Manifest медиафайлов не совпадает с количеством файлов');
  const hasUnknownFileSize = files.some(({ file }) => typeof file === 'string');
  const totalBytes = files.reduce((total, { file }) => total + (typeof file === 'string' ? 0 : file.size), 0);
  if (!hasUnknownFileSize && totalBytes >= MAX_MEDIA_BATCH_SIZE) {
    throw new Error('Суммарный размер файлов должен быть меньше 100 МБ');
  }

  const formData = new FormData();
  files.forEach(({ file, originalName, extension, isVideo, mimeType }) => {
    formData.append('files', createUploadFile({ file, originalName, extension, isVideo, mimeType }) as never);
  });
  if (uploadOptions.scope) formData.append('scope', uploadOptions.scope);
  if (uploadOptions.feedbackId) formData.append('feedbackId', uploadOptions.feedbackId);
  formData.append('manifest', JSON.stringify(manifest));
  return formData;
}

export interface MediaUploadFile {
  file: MediaSource;
  originalName: string;
  extension: string;
  isVideo: boolean;
  mimeType: string;
}

function createUploadFile({ file, originalName, extension, isVideo, mimeType }: MediaUploadFile) {
  return typeof file === 'string'
    ? {
        uri: file,
        name: originalName || `runich-${Date.now()}.${extension || getExtensionFromMimeType(mimeType, isVideo)}`,
        type: mimeType,
      }
    : file;
}

function getFileName(fileSrc: MediaSource) {
  if (typeof fileSrc !== 'string') return fileSrc.name;

  const cleanPath = fileSrc.split(/[?#]/, 1)[0];
  return cleanPath.split(/[\\/]/).at(-1) ?? '';
}

function getFileExtension(fileName: string) {
  return fileName.match(/\.([^.]+)$/)?.[1].toLowerCase() ?? '';
}

function getFileMimeType(fileSrc: MediaSource, extension: string) {
  if (typeof fileSrc !== 'string' && fileSrc.type) return fileSrc.type;
  if (VIDEO_FILE_EXTENSIONS.has(extension)) return VIDEO_MIME_TYPES[extension] ?? 'video/mp4';
  return IMAGE_MIME_TYPES[extension] ?? 'application/octet-stream';
}

function getExtensionFromMimeType(mimeType: string, isVideo: boolean) {
  const [, subtype] = mimeType.split('/');
  if (!subtype) return isVideo ? 'mp4' : 'jpg';

  return (
    {
      '3gpp': '3gp',
      '3gpp2': '3g2',
      quicktime: 'mov',
      'x-m4v': 'm4v',
      'x-matroska': 'mkv',
      'x-msvideo': 'avi',
      'x-ms-wmv': 'wmv',
      'x-icon': 'ico',
      'svg+xml': 'svg',
    }[subtype] ?? subtype
  );
}
