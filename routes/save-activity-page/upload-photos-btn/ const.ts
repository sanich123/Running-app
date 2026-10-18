import { LANGUAGES } from '@const/enums';
import type { ActivityPhoto } from '@R/slices/activity/types';

export const MAX_ACTIVITY_MEDIA = 5;

export interface UploadPhotoBtnProps {
  isDisabled: boolean;
  setIsDisabled: (arg: boolean) => void;
  setImages: (arg: ActivityPhoto[]) => void;
  images: ActivityPhoto[];
  activityId?: string;
}

export const UPLOAD_PHOTO_BTN = {
  [LANGUAGES.english]: {
    accessibilityLabel: 'Upload photos or videos from gallery',
    activityMedia: 'Photos and videos',
    cancelUpload: 'Cancel media upload',
    uploadHint: 'Up to 5 photos or videos. Videos can be up to 1 minute',
  },
  [LANGUAGES.russian]: {
    accessibilityLabel: 'Загрузить фото или видео из галереи',
    activityMedia: 'Фото и видео',
    cancelUpload: 'Отменить загрузку медиа',
    uploadHint: 'Можно добавить до 5 фото или видео. Видео — до 1 минуты',
  },
} as const;
