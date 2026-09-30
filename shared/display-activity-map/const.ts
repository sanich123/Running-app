import { LANGUAGES } from '@const/enums';

export const DISPLAY_ACTIVITY_MAP_TEXT = {
  [LANGUAGES.english]: {
    insufficientData: 'Not enough data to display the route',
    zoomIn: 'Zoom in on the map',
    zoomOut: 'Zoom out on the map',
    satellite: 'Satellite',
    map: 'Map',
    start: 'Workout start',
    end: 'Workout finish',
    kilometreUnit: 'km',
  },
  [LANGUAGES.russian]: {
    insufficientData: 'Недостаточно данных для отображения маршрута',
    zoomIn: 'Увеличить масштаб карты',
    zoomOut: 'Уменьшить масштаб карты',
    satellite: 'Спутник',
    map: 'Карта',
    start: 'Начало тренировки',
    end: 'Конец тренировки',
    kilometreUnit: 'км',
  },
} as const;

export const DISPLAY_ACTIVITY_MAP_STYLES = {
  satellite: 'mapbox://styles/mapbox/standard-satellite',
  map: 'mapbox://styles/mapbox/standard',
} as const;
export const DISPLAY_ACTIVITY_MAP_SPEED_COLORS = ['#22c55e', '#facc15', '#ef4444'] as const;
export const DISPLAY_ACTIVITY_MAP_INITIAL_ZOOM = 14;
export const DISPLAY_ACTIVITY_MAP_MIN_ZOOM = 3;
export const DISPLAY_ACTIVITY_MAP_MAX_ZOOM = 20;
