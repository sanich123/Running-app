import { LANGUAGES } from '@const/enums';

export const CAMERA_SETTINGS = {
  quality: 1,
  base64: true,
  exif: false,
};

export const CAMERA_TEXT = {
  [LANGUAGES.english]: {
    cancelUpload: 'Cancel photo upload',
    title: 'Take a photo',
    permissionLoading: 'Preparing camera…',
    permissionTitle: 'Camera access is needed',
    permissionDescription: 'Allow camera access to take photos for your activity.',
    allowCamera: 'Allow camera',
  },
  [LANGUAGES.russian]: {
    cancelUpload: 'Отменить загрузку фото',
    title: 'Сделать фото',
    permissionLoading: 'Подготавливаем камеру…',
    permissionTitle: 'Нужен доступ к камере',
    permissionDescription: 'Разрешите доступ к камере, чтобы добавить фото к активности.',
    allowCamera: 'Разрешить камеру',
  },
} as const;
