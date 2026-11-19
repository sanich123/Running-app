import * as MediaCompression from './file-sending/media-compression';
import * as MediaGallery from './file-sending/media-gallery';
import * as MediaReview from './file-sending/media-review';
import * as MediaUpload from './file-sending/media-upload';

export const compressMediaFile = MediaCompression.compressMediaFile;
export const createVideoThumbnail = MediaCompression.createVideoThumbnail;
export const getAccessToGallery = MediaGallery.getAccessToGallery;
export const waitForMediaUploadReview = MediaReview.waitForMediaUploadReview;
export const deleteUploadedMedia = MediaUpload.deleteUploadedMedia;
export const uploadMediaFile = MediaUpload.uploadMediaFile;
export const uploadMediaFiles = MediaUpload.uploadMediaFiles;
export type { UploadMediaBatchRequest, UploadMediaRequest } from './file-sending/media-upload';
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
