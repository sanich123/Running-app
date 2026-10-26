import { LANGUAGES } from '@const/enums';

export const ACTIVITY_MEDIA_COPY = {
  [LANGUAGES.english]: {
    openMap: 'Open activity map',
    openMedia: 'Open activity media',
    playVideo: 'Play video',
    pauseVideo: 'Pause video',
    muteVideo: 'Mute video',
    unmuteVideo: 'Unmute video',
    mediaActions: 'Media actions',
    report: 'Report',
    restrictedRoute: 'The user has disabled activity route viewing',
  },
  [LANGUAGES.russian]: {
    openMap: 'Открыть карту тренировки',
    openMedia: 'Открыть медиа тренировки',
    playVideo: 'Воспроизвести видео',
    pauseVideo: 'Приостановить видео',
    muteVideo: 'Выключить звук видео',
    unmuteVideo: 'Включить звук видео',
    mediaActions: 'Дополнительные действия с медиа',
    report: 'Сообщить о нарушении',
    restrictedRoute: 'Пользователь запретил просматривать информацию о своем маршруте',
  },
} as const;
