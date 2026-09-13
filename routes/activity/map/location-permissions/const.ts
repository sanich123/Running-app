import { LANGUAGES } from '@const/enums';

export const LOCATION_PERMISSIONS_TEXT = {
  [LANGUAGES.english]: {
    profileTitle: 'Complete your profile',
    profileDescription: 'Fill in at least one profile field to record and save activities.',
    profileAction: 'Complete profile',
    profileErrorTitle: 'Could not check your profile',
    profileErrorDescription:
      'The map and activity recording will appear after your profile is checked. Check your internet connection and try again.',
  },
  [LANGUAGES.russian]: {
    profileTitle: 'Заполните профиль',
    profileDescription: 'Заполните хотя бы одно поле профиля, чтобы записывать и сохранять активности.',
    profileAction: 'Заполнить профиль',
    profileErrorTitle: 'Не удалось проверить профиль',
    profileErrorDescription:
      'Карта и запись активности появятся после проверки профиля. Проверьте интернет и попробуйте ещё раз.',
  },
} as const;
