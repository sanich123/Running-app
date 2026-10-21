import { LANGUAGES } from '@const/enums';

export const MAP_VISIBILITY = {
  [LANGUAGES.english]: {
    title: 'Map visibility',
    shown: 'Map shown',
    hidden: 'Route only',
    shownSegment: 'Shown',
    hiddenSegment: 'Hidden',
    hideMap: 'Hide map',
  },
  [LANGUAGES.russian]: {
    title: 'Видимость карты',
    shown: 'Карта показана',
    hidden: 'Только маршрут',
    shownSegment: 'Показана',
    hiddenSegment: 'Скрыта',
    hideMap: 'Скрыть карту',
  },
} as const;

export const ROUTE_PREVIEW_PATH =
  'M54 177 L93 164 L117 151 L142 157 L159 138 L174 117 L169 94 L193 81 L208 52 L230 64 L241 94 L270 106 L288 127 L315 132 L337 159 L359 166';
