import { LANGUAGES } from '@const/enums';

export const UNSYNCED_ACTIVITIES_TEXT = {
  [LANGUAGES.english]: {
    title: (count: number) => `${count} saved activit${count === 1 ? 'y' : 'ies'}`,
    sending: 'Sending activities…',
    pending: 'They will be sent when you reconnect',
    restoreRouteError: 'Could not restore the activity route',
    success: 'Updated successfully',
    send: 'Send unsynced activities',
    remove: 'Delete unsynced activities',
  },
  [LANGUAGES.russian]: {
    title: (count: number) => `Есть ${count} сохраненные активности`,
    sending: 'Отправляем активности…',
    pending: 'Они будут отправлены при подключении',
    restoreRouteError: 'Не удалось восстановить маршрут активности',
    success: 'Успешно обновили',
    send: 'Отправить несинхронизированные активности',
    remove: 'Удалить несинхронизированные активности',
  },
} as const;
