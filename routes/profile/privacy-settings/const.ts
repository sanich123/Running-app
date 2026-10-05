import { LANGUAGES } from '@const/enums';

export const PROFILE_PRIVACY_SETTINGS = {
  [LANGUAGES.english]: {
    title: 'Privacy',
    openSettings: 'Privacy settings',
    openSettingsDescription: 'Profile visibility, activity interactions, statistics and photos.',
    profileSearch: 'Show profile in search',
    profileSearchDescription: 'When disabled, other users cannot find your profile through search.',
    activityInteractions: 'Allow likes and comments',
    activityInteractionsDescription: 'Other users can like and comment on your activities.',
    hideActivityStatistics: 'Hide total activity statistics',
    hideActivityStatisticsDescription: 'Hide the total number of activities, distance and time on your profile.',
    hideFollowingList: 'Hide following and followers lists',
    hideFollowingListDescription:
      'Other users will not be able to open the lists of people you follow or who follow you.',
    hideProfilePhotos: 'Hide profile photos',
    hideProfilePhotosDescription: 'Other users will not see the photos shown at the top of your profile.',
    saveError: 'Could not save privacy settings.',
  },
  [LANGUAGES.russian]: {
    title: 'Конфиденциальность',
    openSettings: 'Настройки конфиденциальности',
    openSettingsDescription: 'Видимость профиля, взаимодействия, статистика и фотографии.',
    profileSearch: 'Показывать профиль в поиске',
    profileSearchDescription: 'Если выключить, другие пользователи не смогут найти вас через поиск.',
    activityInteractions: 'Разрешить лайки и комментарии',
    activityInteractionsDescription: 'Другие пользователи смогут лайкать и комментировать ваши активности.',
    hideActivityStatistics: 'Скрывать общую статистику тренировок',
    hideActivityStatisticsDescription: 'Скрывает суммарное число тренировок, дистанцию и время в профиле.',
    hideFollowingList: 'Скрывать списки подписок и подписчиков',
    hideFollowingListDescription: 'Другие пользователи не смогут просматривать ваши списки подписок и подписчиков.',
    hideProfilePhotos: 'Скрывать фотографии в профиле',
    hideProfilePhotosDescription: 'Другие пользователи не будут видеть фотографии в верхней части профиля.',
    saveError: 'Не удалось сохранить настройки конфиденциальности.',
  },
} as const;

export const PROFILE_PRIVACY_SETTING_FIELDS = [
  { key: 'profileSearchVisible', label: 'profileSearch', description: 'profileSearchDescription' },
  { key: 'allowActivityInteractions', label: 'activityInteractions', description: 'activityInteractionsDescription' },
  { key: 'hideActivityStatistics', label: 'hideActivityStatistics', description: 'hideActivityStatisticsDescription' },
  { key: 'hideFollowingList', label: 'hideFollowingList', description: 'hideFollowingListDescription' },
  { key: 'hideProfilePhotos', label: 'hideProfilePhotos', description: 'hideProfilePhotosDescription' },
] as const;

export type ProfilePrivacySettingKey = (typeof PROFILE_PRIVACY_SETTING_FIELDS)[number]['key'];
