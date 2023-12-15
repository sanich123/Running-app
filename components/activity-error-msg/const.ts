import { LANGUAGES } from '../../constants/enums';

export const ACTIVITY_ERROR_MSG = {
  [LANGUAGES.english]: {
    errorMsg:
      "Your phone (or, maybe, you) shuted our app in the background. Don't worry, we do our best to recover state of your activity.Note, that activity is paused, so you have to continue manually",
  },
  [LANGUAGES.russian]: {
    errorMsg:
      'Ваш телефон (или может быть Вы) заглушил приложение в фоновом режиме. Мы сделали все, что возможно, чтобы восстановить Ваши данные. Активность поставлена на паузу, чтобы продолжить, вы должны нажать кнопку продолжить',
  },
} as const;
