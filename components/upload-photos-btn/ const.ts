import { LANGUAGES } from '../../constants/enums';

export type UploadPhotoBtnProps = {
  isDisabled: boolean;
  setIsDisabled: (arg: boolean) => void;
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
};
