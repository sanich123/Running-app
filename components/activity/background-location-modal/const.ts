import { LANGUAGES } from '@const/enums';

export const BACKGROUND_LOCATIONS = {
  [LANGUAGES.russian]: {
    needToAllow:
      'Необходимо дать разрешение на получение данных о местоположении в фоновом режиме все время. Это необходимо из-за того, что когда вы выходите иp приложения - оно перестает работать и получать данные о локации, нужные приложению для сохранения данных о маршруте и метрик',
    giveAccess: 'Дать доступ к местоположению в фоне',
  },
  [LANGUAGES.english]: {
    needToAllow:
      'You must give permission to receive location data in the background at all times. This is necessary because when you exit the application, it stops working and receiving location data that the application needs to save route data and metrics',
    giveAccess: 'Give access to location in background',
  },
};
