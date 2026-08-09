import { LANGUAGES } from '@const/enums';

export const enum AvatarShowableTestIds {
  isLoading = 'avatarShowableLoadingIcon',
  success = 'avatarShowableImage',
  error = 'avatarShowableErrorIcon',
  default = 'avatarShowableDefaultIcon',
}

export const enum AvatarShowableIcons {
  error = 'web-cancel',
  default = 'account-circle-outline',
}

export const AVATAR_SHOWABLE = {
  [LANGUAGES.english]: {
    successPhotoRenewing: 'Profile photo has been renewed',
    failurePhotoRenewing: 'An error. Profile photo has not been renewed',
  },
  [LANGUAGES.russian]: {
    successPhotoRenewing: 'Обновили фото профиля',
    failurePhotoRenewing: 'Не удалось обновить фото профиля',
  },
} as const;
