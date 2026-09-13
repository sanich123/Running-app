import { LANGUAGES } from '@const/enums';

export const DISPLAY_ACTIVITY_MAP_TEXT = {
  [LANGUAGES.english]: {
    insufficientData: 'Not enough data to display the route',
    zoomIn: 'Zoom in on the map',
    zoomOut: 'Zoom out on the map',
    start: 'Workout start',
    end: 'Workout finish',
  },
  [LANGUAGES.russian]: {
    insufficientData: 'Недостаточно данных для отображения маршрута',
    zoomIn: 'Увеличить масштаб карты',
    zoomOut: 'Уменьшить масштаб карты',
    start: 'Начало тренировки',
    end: 'Конец тренировки',
  },
} as const;
