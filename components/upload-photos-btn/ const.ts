import { LANGUAGES } from '../../constants/enums';

export type UploadPhotoBtnProps = {
  isDisabled: boolean;
  setIsDisabled: (arg: boolean) => void;
  setImages: (arg: { url: string; thumbnail: string | null }[]) => void;
  images: { url: string; thumbnail: string | null }[];
};

export const UPLOAD_PHOTO_BTN = {
  [LANGUAGES.english]: {
    isLoading: 'Uploading..',
    isInitial: 'Upload',
  },
  [LANGUAGES.russian]: {
    isLoading: 'Загружаю..',
    isInitial: 'Загрузить',
  },
} as const;
