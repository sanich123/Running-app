import { LANGUAGES } from '@const/enums';

export const BACKGROUND_LOCATIONS = {
  [LANGUAGES.russian]: {
    needToAllow:
      'Runich собирает геопозицию для записи маршрута активной тренировки, даже если экран заблокирован или приложение работает в фоне. Фоновая геолокация используется только пока тренировка записывается и прекращается после ее остановки.',
    giveAccess: 'Дать доступ к местоположению в фоне',
  },
  [LANGUAGES.english]: {
    needToAllow:
      'Runich collects your location to record the route of an active workout, even when the screen is locked or the app is running in the background. Background location is used only while the workout is being recorded and stops when you stop it.',
    giveAccess: 'Give access to location in background',
  },
};
