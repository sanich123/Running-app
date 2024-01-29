export enum STATUSES {
  initial = 'initial',
  started = 'started',
  paused = 'paused',
  continued = 'continue',
}

export enum LANGUAGES {
  russian = 'russian',
  english = 'english',
}

export enum ROUTES {
  index = 'index',
  home = 'home',
  settings = 'settings',
  saveActivity = 'save-activity',
  comment = 'comment',
  users = 'users',
  activity = 'activity',
  progress = 'progress',
  followers = 'followers',
  following = 'following',
  likes = 'likes',
  map = 'map',
  media = 'media',
  mediaGrid = 'media-grid',
  profile = 'profile',
  manualActivity = 'manual-activity',
  profileSettings = 'profile-settings',
}

export const LABELS = {
  [LANGUAGES.english]: {
    feed: 'Feed',
    activity: 'Activity',
    activities: 'Тренировки',
    statistics: 'Statistics',
    profile: 'Profile',
    settings: 'Settings',
    users: 'Users',
    comment: 'Comment',
    followers: 'Followers',
    followings: 'Followings',
    likes: 'Likes',
    map: 'Map',
    photo: 'Photo',
    photos: 'Photos',
    profileSettings: 'Profile settings',
  },
  [LANGUAGES.russian]: {
    feed: 'Лента',
    activity: 'Активность',
    activities: 'Тренировки',
    statistics: 'Статистика',
    profile: 'Профиль',
    settings: 'Настройки',
    users: 'Пользователи',
    comment: 'Комментарий',
    followers: 'Отслеживающие',
    followings: 'Отслеживаемые',
    likes: 'Лайки',
    map: 'Карта',
    photo: 'Фотография',
    photos: 'Фотографии',
    profileSettings: 'Настройки профиля',
  },
};
