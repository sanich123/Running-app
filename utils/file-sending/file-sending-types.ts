export type MediaSource = string | File;

export interface MediaUploadOptions {
  scope?: 'activity' | 'profile' | 'feedback';
  feedbackId?: string;
}

export interface CompressedMediaFile {
  file: MediaSource;
  originalName: string;
  extension: string;
  isVideo: boolean;
}
