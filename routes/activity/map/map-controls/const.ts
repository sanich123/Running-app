import { LANGUAGES } from '@const/enums';

export const LOCATION_ACCURACY_WARNING = {
  [LANGUAGES.english]: (accuracy: number) =>
    `Location accuracy is low: the margin of error is about ${accuracy} m. This may affect route accuracy.`,
  [LANGUAGES.russian]: (accuracy: number) =>
    `Качество геопозиции невысокое: погрешность около ${accuracy} м. Это может повлиять на точность маршрута.`,
};
