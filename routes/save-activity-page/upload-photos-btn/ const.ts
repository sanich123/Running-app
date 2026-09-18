import { LANGUAGES } from '@const/enums';

export const MAX_ACTIVITY_MEDIA = 10;

export interface UploadPhotoBtnProps {
  isDisabled: boolean;
  setIsDisabled: (arg: boolean) => void;
  setImages: (arg: { url: string; thumbnail: string | null }[]) => void;
  images: { url: string; thumbnail: string | null }[];
}

export const UPLOAD_PHOTO_BTN = {
  [LANGUAGES.english]: {
    accessibilityLabel: 'Upload photos or videos from gallery',
    cancelUpload: 'Cancel media upload',
    uploadHint:
      'Up to 10 photos or videos under 100 MB total. Uploading 10 files may take a while — check your connection speed.',
  },
  [LANGUAGES.russian]: {
    accessibilityLabel: 'Загрузить фото или видео из галереи',
    cancelUpload: 'Отменить загрузку медиа',
    uploadHint:
      'Можно загрузить до 10 фото или видео общим размером менее 100 МБ. Загрузка 10 файлов может занять время — обрати внимание на скорость соединения.',
  },
} as const;
