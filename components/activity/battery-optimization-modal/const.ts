import { LANGUAGES } from '@const/enums';

export const BATTERY_OPTIMIZATION = {
  [LANGUAGES.russian]: {
    optimizationMessage:
      'Ваш телефон оптимизирует батарею. Несмотря на то, что приложению предоставлено разрешение отслеживать местоположение в фоновом режиме, через 10-15 минут операционная система в целях экономии энергии закончит выполнение приложения и приложение  перестанет получать данные о местоположении, тренировка не будет записана.Чтобы этого избежать, надо снять все ограничения по оптимизации батареи телефоном После нажатия кнопки появится окно системных настроек, в котором надо будет выбрать приложение Runich, появится меню настроек из 2х пунктов.Надо нажать на пункт фоновая активность. В появившемся меню снять все ограничения телефона',
    unoptimizeApp: 'Снять оптимизации батареи',
  },

  [LANGUAGES.english]: {
    optimizationMessage:
      'Despite the fact that the application is granted permission to track location in the background, after 10-15 minutes the operating system will finish executing the application in order to save energy and the application will stop receiving location data, the workout will not be recorded. To avoid this, you must remove all restrictions on phone battery optimization. After pressing the button, a system settings window will appear, in which you will need to select the Runich application, a settings menu of 2 items will appear. You must click on the background activity item. In the menu that appears, remove all phone restrictions',
    unoptimizeApp: 'Turn off phone optimizations',
  },
};
