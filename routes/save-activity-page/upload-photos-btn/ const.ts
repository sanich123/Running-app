import { LANGUAGES } from '@const/enums';

export interface UploadPhotoBtnProps {
  isDisabled: boolean;
  setIsDisabled: (arg: boolean) => void;
  setImages: (arg: { url: string; thumbnail: string | null }[]) => void;
  images: { url: string; thumbnail: string | null }[];
}

export const UPLOAD_PHOTO_BTN = {
  [LANGUAGES.english]: {
    isLoading: 'Uploading…',
    isInitial: 'Upload photo',
  },
  [LANGUAGES.russian]: {
    isLoading: 'Загружаю…',
    isInitial: 'Загрузить фото',
  },
} as const;
