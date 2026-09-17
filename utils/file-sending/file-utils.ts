import type { MediaUploadOptions, MediaSource } from './file-sending-types';

export const MAX_MEDIA_FILE_SIZE = 15 * 1024 * 1024;
export const VIDEO_FILE_EXTENSIONS = new Set(['mp4', 'mov', 'avi', 'm4v', 'webm', 'mkv', '3gp']);

export function getMediaFileInfo(fileSrc: MediaSource) {
  const fileName = getFileName(fileSrc);
  const extension = getFileExtension(fileName);
  const isVideo = VIDEO_FILE_EXTENSIONS.has(extension) || isBrowserVideo(fileSrc);

  return { fileName, extension, isVideo };
}

export function isSupportedImageExtension(extension: string) {
  return /^(webp|png|avif|heic|jpeg|gif|svg|ico|jpg)$/.test(extension);
}

export function createMediaUploadFormData({
  file,
  originalName,
  extension,
  isVideo,
  uploadOptions,
}: {
  file: MediaSource;
  originalName: string;
  extension: string;
  isVideo: boolean;
  uploadOptions: MediaUploadOptions;
}) {
  const formData = new FormData();
  const uploadFile =
    typeof file === 'string'
      ? {
          uri: file,
          name: originalName || `runich-${Date.now()}.${isVideo ? 'mp4' : extension || 'jpg'}`,
          type: isVideo ? 'video/mp4' : 'image/jpeg',
        }
      : file;

  formData.append('file', uploadFile as never);
  if (uploadOptions.scope) formData.append('scope', uploadOptions.scope);
  if (uploadOptions.feedbackId) formData.append('feedbackId', uploadOptions.feedbackId);
  return formData;
}

function getFileName(fileSrc: MediaSource) {
  if (typeof fileSrc !== 'string') return fileSrc.name;

  const cleanPath = fileSrc.split(/[?#]/, 1)[0];
  return cleanPath.split(/[\\/]/).at(-1) ?? '';
}

function getFileExtension(fileName: string) {
  return fileName.split('.').at(-1)?.toLowerCase() ?? '';
}

function isBrowserVideo(fileSrc: MediaSource) {
  return typeof fileSrc !== 'string' && fileSrc.type.startsWith('video/');
}
