import { LANGUAGES } from '@const/enums';

export const ACTIVITY_ROUTE_REPLAY_DEFAULT_DURATION_MS = 60_000;
export const ACTIVITY_ROUTE_REPLAY_DURATIONS_MS = [
  15_000, 30_000, 45_000, 60_000, 90_000, 120_000, 180_000, 240_000, 300_000,
] as const;
export const ACTIVITY_ROUTE_REPLAY_MAX_DURATION_MS = 300_000;
export const ACTIVITY_ROUTE_REPLAY_CAMERA_HEADING_LOOKAHEAD_METERS = 250;
export const ACTIVITY_ROUTE_REPLAY_CAMERA_HEADING_SMOOTHING_MS = 350;
export const ACTIVITY_ROUTE_REPLAY_CAMERA_PITCH = 60;
export const ACTIVITY_ROUTE_REPLAY_CAMERA_ZOOM_LEVEL = 14.5;
export const ACTIVITY_ROUTE_REPLAY_CAMERA_MIN_ZOOM_LEVEL = 10;
export const ACTIVITY_ROUTE_REPLAY_CAMERA_MAX_ZOOM_LEVEL = 18;
export const ACTIVITY_ROUTE_REPLAY_CAMERA_ZOOM_STEP = 1;
export const ACTIVITY_ROUTE_REPLAY_SEEK_CAMERA_INTERVAL_MS = 64;
export const ACTIVITY_ROUTE_REPLAY_SEEK_CAMERA_ANIMATION_MS = 110;
export const ACTIVITY_ROUTE_REPLAY_SEEK_CAMERA_SETTLE_MS = 240;
export const ACTIVITY_ROUTE_REPLAY_EXPORT_FPS = 24;
export const ACTIVITY_ROUTE_REPLAY_EXPORT_COVER_DURATION_MS = 1000;
export const ACTIVITY_ROUTE_REPLAY_EXPORT_MAX_DIMENSION_PX = 1280;
export const ACTIVITY_ROUTE_REPLAY_EXPORT_MAX_SIZE_BYTES = 25 * 1024 * 1024;
export const ACTIVITY_ROUTE_REPLAY_EXPORT_MAX_BITRATE = 1_800_000;
export const ACTIVITY_ROUTE_REPLAY_TERRAIN_EXAGGERATION = 1.5;
export const ACTIVITY_ROUTE_REPLAY_MAP_STYLES = {
  satellite: 'mapbox://styles/mapbox/standard-satellite',
  map: 'mapbox://styles/mapbox/standard',
} as const;
export const ACTIVITY_ROUTE_REPLAY_TERRAIN_SOURCE_URL = 'mapbox://mapbox.mapbox-terrain-dem-v1';

export const ACTIVITY_ROUTE_REPLAY_TEXT = {
  [LANGUAGES.english]: {
    play: 'Play workout route',
    pause: 'Pause workout route',
    resume: 'Resume workout route',
    replay: 'Replay workout route',
    position: 'Route playback position',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    duration: 'Replay and video length',
    durationSecondsUnit: 's',
    durationMinutesUnit: 'm',
    videoExportHint: 'Replay and exported video use the selected map style, zoom and duration.',
    paceUnit: 'min/km',
    playbackTime: 'Playback',
    workoutTime: 'Workout',
    currentSpeed: 'Speed',
    shareVideo: 'Share workout video',
    shareUnavailable: 'Video sharing is unavailable on this device',
    exportProgress: 'Preparing video',
    exportStayOnPage: 'Please stay on this page',
    videoReady: 'Workout video is ready',
    videoSize: 'File size',
    cancel: 'Cancel',
    share: 'Share',
    kmh: 'km/h',
    satellite: 'Satellite',
    map: 'Map',
    insufficientData: 'This workout does not have enough route data to replay',
  },
  [LANGUAGES.russian]: {
    play: 'Начать воспроизведение маршрута',
    pause: 'Поставить воспроизведение на паузу',
    resume: 'Продолжить воспроизведение маршрута',
    replay: 'Повторить маршрут тренировки',
    position: 'Позиция воспроизведения маршрута',
    zoomIn: 'Приблизить карту',
    zoomOut: 'Отдалить карту',
    duration: 'Длительность повтора и видео',
    durationSecondsUnit: 'с',
    durationMinutesUnit: 'м',
    videoExportHint: 'Для повтора и видео будут использоваться выбранный тип карты, зум и длительность.',
    paceUnit: 'мин/км',
    playbackTime: 'Повтор',
    workoutTime: 'Тренировка',
    currentSpeed: 'Скорость',
    shareVideo: 'Поделиться видео тренировки',
    shareUnavailable: 'На этом устройстве нельзя поделиться видео',
    exportProgress: 'Подготовка видео',
    exportStayOnPage: 'Не уходите с текущей страницы',
    videoReady: 'Видео тренировки готово',
    videoSize: 'Размер файла',
    cancel: 'Отмена',
    share: 'Поделиться',
    kmh: 'км/ч',
    satellite: 'Спутник',
    map: 'Карта',
    insufficientData: 'Для повтора тренировки недостаточно данных о маршруте',
  },
} as const;
