import { LANGUAGES } from '@const/enums';

export const BATTERY_OPTIMIZATION = {
  [LANGUAGES.russian]: {
    optimizationMessage:
      'Оптимизация батареи может остановить запись маршрута через 10–15 минут, даже если фоновые разрешения уже выданы.\n\nЧтобы тренировка записалась полностью, отключите ограничения батареи для Runich. Кнопка запуска тренировки доступна и без этого шага.',
    unoptimizeApp: 'Снять оптимизации батареи',
  },

  [LANGUAGES.english]: {
    optimizationMessage:
      'Battery optimization may stop route recording after 10–15 minutes, even when background location permission is granted.\n\nTo record the full workout, remove battery restrictions for Runich. The start button remains available without this step.',
    unoptimizeApp: 'Turn off phone optimizations',
  },
};
