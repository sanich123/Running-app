export type MediaSource = string | File;

export interface MediaSourceMetadata {
  fileName?: string | null;
  mimeType?: string | null;
  mediaType?: 'image' | 'video' | null;
}

export interface MediaUploadOptions {
  scope?: 'activity' | 'profile' | 'feedback';
  feedbackId?: string;
}

export interface MediaUploadControl {
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export interface MediaUploadItem {
  fileSrc: MediaSource;
  metadata?: MediaSourceMetadata;
  mediaId: string;
}

export interface UploadedMedia {
  url?: string | null;
  thumbnail: string | null;
  blurhash?: string | null;
  assetId?: string;
  thumbnailAssetId?: string;
  mediaReviewStatus?: 'queued' | 'processing' | 'review_required' | 'approved' | 'rejected' | 'failed' | null;
  contentType?: string;
}

export interface CompressedMediaFile {
  file: MediaSource;
  originalName: string;
  extension: string;
  isVideo: boolean;
  mimeType: string;
}
