import { LANGUAGES } from '@const/enums';

export const PROFILE_PRIVACY_SETTINGS = {
  [LANGUAGES.english]: {
    title: 'Privacy',
    openSettings: 'Privacy',
    profileSearch: 'Show profile in search',
    profileSearchDescription: 'When disabled, other users cannot find your profile through search.',
    allowNewFollowers: 'Allow new followers',
    allowNewFollowersDescription: 'When disabled, other users cannot follow your profile.',
    activityInteractions: 'Allow likes, comments and likes list viewing',
    activityInteractionsDescription:
      'If disabled, other users cannot like or comment on your activities or view who liked them.',
    allowActivityReplayViewing: 'Allow viewing activity locations and video replays',
    allowActivityReplayViewingDescription: 'Other users can replay the routes of your activities.',
    allowActivitySharing: 'Allow sharing activities',
    allowActivitySharingDescription: 'Other users can share your activities.',
    hideActivityStatistics: 'Hide total activity statistics',
    hideActivityStatisticsDescription: 'Hide the total number of activities, distance and time on your profile.',
    hideFollowingList: 'Hide following and followers lists',
    hideFollowingListDescription:
      'Other users will not be able to open the lists of people you follow or who follow you.',
    hideProfilePhotos: 'Hide profile photos',
    hideProfilePhotosDescription: 'Other users will not see the photos shown at the top of your profile.',
    saveCameraPhotosToGallery: 'Save camera photos to phone',
    saveCameraPhotosToGalleryDescription: 'Keep a copy of photos taken with the Runich camera in your phone gallery.',
    saveCameraPhotosPermissionDenied: 'Gallery write permission was not granted, so this setting remains off.',
    saveCameraPhotosPermissionError: 'Could not enable saving camera photos to the phone.',
    saveError: 'Could not save privacy settings.',
  },
  [LANGUAGES.russian]: {
    title: 'Конфиденциальность',
    openSettings: 'Конфиденциальность',
    profileSearch: 'Показывать профиль в поиске',
    profileSearchDescription: 'Если выключить, другие пользователи не смогут найти вас через поиск.',
    allowNewFollowers: 'Разрешить подписываться на меня',
    allowNewFollowersDescription: 'Если выключить, другие пользователи не смогут подписаться на ваш профиль.',
    activityInteractions: 'Разрешить лайки, комментарии и просмотр списка лайкнувших',
    activityInteractionsDescription:
      'Если выключить, другие пользователи не смогут лайкать и комментировать активности и смотреть список лайкнувших.',
    allowActivityReplayViewing: 'Разрешить просмотр маршрута активности и повтор видео',
    allowActivityReplayViewingDescription: 'Другие пользователи могут проигрывать маршруты ваших активностей.',
    allowActivitySharing: 'Разрешить делиться активностями',
    allowActivitySharingDescription: 'Другие пользователи могут делиться вашими активностями.',
    hideActivityStatistics: 'Скрывать общую статистику тренировок',
    hideActivityStatisticsDescription: 'Скрывает суммарное число тренировок, дистанцию и время в профиле.',
    hideFollowingList: 'Скрывать списки подписок и подписчиков',
    hideFollowingListDescription: 'Другие пользователи не смогут просматривать ваши списки подписок и подписчиков.',
    hideProfilePhotos: 'Скрывать фотографии в профиле',
    hideProfilePhotosDescription: 'Другие пользователи не будут видеть фотографии в верхней части профиля.',
    saveCameraPhotosToGallery: 'Сохранять фото с камеры в галерею телефона',
    saveCameraPhotosToGalleryDescription:
      'Копия снимков, сделанных камерой Runich, будет сохраняться в галерее телефона.',
    saveCameraPhotosPermissionDenied: 'Нет разрешения на запись в галерею, настройка осталась выключенной.',
    saveCameraPhotosPermissionError: 'Не удалось включить сохранение фото в галерею телефона.',
    saveError: 'Не удалось сохранить настройки конфиденциальности.',
  },
} as const;

export const PROFILE_PRIVACY_SETTING_FIELDS = [
  { key: 'profileSearchVisible', label: 'profileSearch', description: 'profileSearchDescription' },
  { key: 'allowNewFollowers', label: 'allowNewFollowers', description: 'allowNewFollowersDescription' },
  { key: 'allowActivityInteractions', label: 'activityInteractions', description: 'activityInteractionsDescription' },
  {
    key: 'allowActivityReplayViewing',
    label: 'allowActivityReplayViewing',
    description: 'allowActivityReplayViewingDescription',
  },
  { key: 'allowActivitySharing', label: 'allowActivitySharing', description: 'allowActivitySharingDescription' },
  { key: 'hideActivityStatistics', label: 'hideActivityStatistics', description: 'hideActivityStatisticsDescription' },
  { key: 'hideFollowingList', label: 'hideFollowingList', description: 'hideFollowingListDescription' },
  { key: 'hideProfilePhotos', label: 'hideProfilePhotos', description: 'hideProfilePhotosDescription' },
] as const;

export type ProfilePrivacySettingKey = (typeof PROFILE_PRIVACY_SETTING_FIELDS)[number]['key'];
