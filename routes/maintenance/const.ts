import { LANGUAGES } from '@const/enums';

export const MAINTENANCE_TEXT = {
  [LANGUAGES.english]: {
    title: 'The server is under maintenance.',
    apology: 'We apologize for the interruption.',
    duration: 'This usually takes no more than 10 minutes.',
    home: 'Go to home',
  },
  [LANGUAGES.russian]: {
    title: 'Технические работы на сервере.',
    apology: 'Приносим свои извинения за перебои в работе!',
    duration: 'Обычно это длится не более 10 минут',
    home: 'Перейти на главную',
  },
} as const;
