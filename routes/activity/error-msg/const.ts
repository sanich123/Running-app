import { LANGUAGES } from '../../../constants/enums';

export const ACTIVITY_ERROR_MSG = {
  [LANGUAGES.english]: {
    recoveryTitle: 'Tracking paused',
    errorMsg:
      'The app was closed in the background, so we restored your activity and paused tracking. Press “Continue” to resume recording.',
    speedTitle: 'GPS signal check',
    tooMuchSpeed: (speed: number, maxSpeed: number) =>
      `We skipped a location at ${speed.toFixed(1)} km/h. It was faster than the safe limit for this activity (${maxSpeed} km/h), so it was most likely a GPS jump.`,
  },
  [LANGUAGES.russian]: {
    recoveryTitle: 'Отслеживание на паузе',
    errorMsg:
      'Приложение было закрыто в фоновом режиме, поэтому мы восстановили данные и поставили отслеживание на паузу. Нажмите «Продолжить», чтобы продолжить запись.',
    speedTitle: 'Проверка сигнала GPS',
    tooMuchSpeed: (speed: number, maxSpeed: number) =>
      `Точка пропущена: скорость ${speed.toFixed(1)} км/ч выше реалистичного предела для этой активности (${maxSpeed} км/ч). Скорее всего, это сбой GPS.`,
  },
} as const;
