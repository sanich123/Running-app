import { LANGUAGES } from '../../constants/enums';

export const ACTIVITY_CLOSE_BTN = {
  [LANGUAGES.russian]: {
    btnText: 'Закрыть',
    alertName: 'Удаление активности',
    alertQuestion: 'Вы уверены?',
    alertAccept: 'Да, я уверен',
  },
  [LANGUAGES.english]: {
    btnText: 'Close',
    alertName: 'Deleting activity',
    alertQuestion: 'Are you sure?',
    alertAccept: 'Yes, I am sure',
  },
} as const;
