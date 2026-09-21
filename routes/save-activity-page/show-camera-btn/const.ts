import { LANGUAGES } from '@const/enums';

export const SHOW_CAMERA_BTN = {
  [LANGUAGES.english]: {
    accessibilityLabel: 'Take a photo with camera',
  },
  [LANGUAGES.russian]: {
    accessibilityLabel: 'Сделать фото камерой',
  },
} as const;
