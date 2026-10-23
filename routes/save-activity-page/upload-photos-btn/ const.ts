import { LANGUAGES } from '@const/enums';
import type { ActivityPhoto } from '@R/slices/activity/types';
import type { MediaUploadPhase } from '@U/file-sending';

export const MAX_ACTIVITY_MEDIA = 5;

export interface UploadPhotoBtnProps {
  isDisabled: boolean;
  setIsDisabled: (arg: boolean) => void;
  setImages: (arg: ActivityPhoto[]) => void;
  images: ActivityPhoto[];
  activityId?: string;
  onUploadStatusChange?: (status: MediaUploadStatus | null) => void;
}

export interface MediaUploadStatus {
  phase: MediaUploadPhase;
  progress: number;
  cancel: () => void;
}

export const UPLOAD_PHOTO_BTN = {
  [LANGUAGES.english]: {
    accessibilityLabel: 'Upload photos or videos from gallery',
    cancelCompression: 'Cancel media compression',
    cancelUpload: 'Cancel media upload',
    compressing: 'Compressing media',
    uploading: 'Uploading media',
    uploadHint: 'Up to 5 photos or videos. Videos can be up to 1 minute',
  },
  [LANGUAGES.russian]: {
    accessibilityLabel: 'Загрузить фото или видео из галереи',
    cancelCompression: 'Отменить сжатие медиа',
    cancelUpload: 'Отменить загрузку медиа',
    compressing: 'Сжатие медиа',
    uploading: 'Загрузка медиа',
    uploadHint: 'Можно добавить до 5 фото или видео. Видео — до 1 минуты',
  },
} as const;
