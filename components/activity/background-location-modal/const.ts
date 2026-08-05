import { LANGUAGES } from '@const/enums';

export const BACKGROUND_LOCATIONS = {
  [LANGUAGES.russian]: {
    needToAllow:
      'Разрешение нужно, чтобы приложение продолжало получать геопозицию при заблокированном экране или свернутом приложении.\n\nБез этого часть маршрута может потеряться, и тренировка сохранится некорректно.',
    giveAccess: 'Дать доступ к местоположению в фоне',
  },
  [LANGUAGES.english]: {
    needToAllow:
      'This permission lets the app keep receiving your location when the screen is locked or the app is minimized.\n\nWithout it, part of the route may be lost and the workout may not be saved correctly.',
    giveAccess: 'Give access to location in background',
  },
};
