import { LANGUAGES } from '../../constants/enums';

export const INPUTS_DISTANCE_TIME = {
  [LANGUAGES.english]: {
    distanceLabel: 'Distance, km',
    hoursLabel: 'Hours, h',
    minutesLabel: 'Minutes, min',
    distancePlaceholder: 'Type a distance',
    hoursPlaceholder: 'Type a time in hours',
    minutesPlaceholder: 'Type a time in minutes',
  },
  [LANGUAGES.russian]: {
    distanceLabel: 'Дистанция, км',
    hoursLabel: 'Время, ч',
    minutesLabel: 'Время, мин',
    distancePlaceholder: 'Введите дистанцию',
    hoursPlaceholder: 'Введите время в часах',
    minutesPlaceholder: 'Введите время в минутах',
  },
};
