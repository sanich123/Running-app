import { LANGUAGES } from '../../../constants/enums';

export const NO_SPEED_ALERT_TIME = '--:--:--';

export const ACTIVITY_ERROR_MSG = {
  [LANGUAGES.english]: {
    recoveryTitle: 'Tracking paused',
    errorMsg: 'The app closed in the background. Press “Continue”.',
    speedTitle: 'GPS signal check',
    tooMuchSpeed: (speed: number, maxSpeed: number, time: string) =>
      `At ${time}: ${speed.toFixed(1)} km/h exceeded the ${maxSpeed} km/h limit. GPS point skipped.`,
  },
  [LANGUAGES.russian]: {
    recoveryTitle: 'Отслеживание на паузе',
    errorMsg: 'Приложение закрылось в фоне. Нажмите «Продолжить».',
    speedTitle: 'Проверка сигнала GPS',
    tooMuchSpeed: (speed: number, maxSpeed: number, time: string) =>
      `В ${time}: ${speed.toFixed(1)} км/ч выше лимита ${maxSpeed} км/ч. Точка GPS пропущена.`,
  },
} as const;
