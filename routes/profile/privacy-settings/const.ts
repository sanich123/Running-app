import { LANGUAGES } from '@const/enums';

export const PROFILE_PRIVACY_SETTINGS = {
  [LANGUAGES.english]: {
    title: 'Privacy',
    openSettings: 'Privacy settings',
    openSettingsDescription:
      'Profile visibility, activity interactions, likes, sharing, email notifications, statistics and photos.',
    profileSearch: 'Show profile in search',
    profileSearchDescription: 'When disabled, other users cannot find your profile through search.',
    activityInteractions: 'Allow likes and comments',
    activityInteractionsDescription: 'Other users can like and comment on your activities.',
    allowLikesListViewing: 'Allow viewing the likes list',
    allowLikesListViewingDescription: 'Other users can open the list of people who liked your activities.',
    allowActivitySharing: 'Allow sharing activities',
    allowActivitySharingDescription: 'Other users can share your activities.',
    emailNotifications: 'Email notifications',
    emailNotificationsDescription: 'Receive notifications about activity and social events by email.',
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
    openSettingsDescription:
      'Видимость профиля, взаимодействия, лайки, распространение активностей, уведомления по электронной почте, статистика и фотографии.',
    profileSearch: 'Показывать профиль в поиске',
    profileSearchDescription: 'Если выключить, другие пользователи не смогут найти вас через поиск.',
    activityInteractions: 'Разрешить лайки и комментарии',
    activityInteractionsDescription: 'Другие пользователи смогут лайкать и комментировать ваши активности.',
    allowLikesListViewing: 'Разрешить просмотр списка лайков',
    allowLikesListViewingDescription: 'Другие пользователи смогут открывать список тех, кто оценил ваши активности.',
    allowActivitySharing: 'Разрешить делиться активностями',
    allowActivitySharingDescription: 'Другие пользователи смогут делиться вашими активностями.',
    emailNotifications: 'Уведомления по электронной почте',
    emailNotificationsDescription: 'Получать по электронной почте уведомления об активностях и событиях.',
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
  { key: 'allowLikesListViewing', label: 'allowLikesListViewing', description: 'allowLikesListViewingDescription' },
  { key: 'allowActivitySharing', label: 'allowActivitySharing', description: 'allowActivitySharingDescription' },
  { key: 'emailNotifications', label: 'emailNotifications', description: 'emailNotificationsDescription' },
  { key: 'hideActivityStatistics', label: 'hideActivityStatistics', description: 'hideActivityStatisticsDescription' },
  { key: 'hideFollowingList', label: 'hideFollowingList', description: 'hideFollowingListDescription' },
  { key: 'hideProfilePhotos', label: 'hideProfilePhotos', description: 'hideProfilePhotosDescription' },
] as const;

export type ProfilePrivacySettingKey = (typeof PROFILE_PRIVACY_SETTING_FIELDS)[number]['key'];
