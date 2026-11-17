import { LANGUAGES } from '@const/enums';

export const UNSYNCED_ACTIVITIES_TEXT = {
  [LANGUAGES.english]: {
    title: (count: number) => `${count} saved activit${count === 1 ? 'y' : 'ies'} or routes`,
    sending: 'Sending saved data…',
    pending: 'They will be sent when you reconnect',
    restoreRouteError: 'Could not restore the activity route',
    success: 'Updated successfully',
    routeSuccess: 'Full route uploaded',
    routeError: 'Could not send the full route. It remains saved for later',
    send: 'Send unsynced activities',
    remove: 'Delete unsynced activities',
  },
  [LANGUAGES.russian]: {
    title: (count: number) => `Не отправлено: ${count} активности или трека`,
    sending: 'Отправляем сохранённые данные…',
    pending: 'Их можно отправить позже при подключении к сети',
    restoreRouteError: 'Не удалось восстановить маршрут активности',
    success: 'Успешно обновили',
    routeSuccess: 'Полный маршрут отправлен',
    routeError: 'Не удалось отправить полный маршрут. Он сохранён для повтора',
    send: 'Отправить несинхронизированные активности',
    remove: 'Удалить несинхронизированные активности',
  },
} as const;

export const HEALTH_SYNC_TEXT = {
  [LANGUAGES.english]: {
    title: (provider: string) => `Syncing with ${provider}`,
    healthKit: 'Apple Health (HealthKit)',
    healthConnect: 'Health Connect',
    reading: (foundCount: number | null) =>
      foundCount === null ? 'Checking for workouts… Found: —' : `Checking workouts… Found: ${foundCount}`,
    sending: (foundCount: number, processedCount: number) =>
      `Found ${foundCount} workouts · Sent ${processedCount} of ${foundCount}`,
    cancel: 'Cancel sync',
  },
  [LANGUAGES.russian]: {
    title: (provider: string) => `Синхронизация с ${provider}`,
    healthKit: 'Apple Health (HealthKit)',
    healthConnect: 'Health Connect',
    reading: (foundCount: number | null) =>
      foundCount === null ? 'Проверяем тренировки… Найдено: —' : `Проверяем тренировки… Найдено: ${foundCount}`,
    sending: (foundCount: number, processedCount: number) =>
      `Найдено тренировок: ${foundCount} · Отправлено ${processedCount} из ${foundCount}`,
    cancel: 'Отменить синхронизацию',
  },
} as const;
