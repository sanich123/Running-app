import { LANGUAGES } from '@const/enums';

export const ACTIVITY_ROUTE_REPLAY_DURATION_MS = 30_000;
export const ACTIVITY_ROUTE_REPLAY_CAMERA_PITCH = 60;
export const ACTIVITY_ROUTE_REPLAY_CAMERA_ZOOM_LEVEL = 13.5;
export const ACTIVITY_ROUTE_REPLAY_TERRAIN_EXAGGERATION = 1.5;
export const ACTIVITY_ROUTE_REPLAY_MAP_STYLE_URL = 'mapbox://styles/mapbox/standard-satellite';
export const ACTIVITY_ROUTE_REPLAY_TERRAIN_SOURCE_URL = 'mapbox://mapbox.mapbox-terrain-dem-v1';

export const ACTIVITY_ROUTE_REPLAY_TEXT = {
  [LANGUAGES.english]: {
    pause: 'Pause workout route',
    resume: 'Resume workout route',
    replay: 'Replay workout route',
    insufficientData: 'This workout does not have enough route data to replay',
  },
  [LANGUAGES.russian]: {
    pause: 'Поставить воспроизведение на паузу',
    resume: 'Продолжить воспроизведение маршрута',
    replay: 'Повторить маршрут тренировки',
    insufficientData: 'Для повтора тренировки недостаточно данных о маршруте',
  },
} as const;
