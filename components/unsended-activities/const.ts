import { LANGUAGES } from '../../constants/enums';

export type ResponseType = {
  error: {
    data: {
      error: string;
      message: string[];
      statusCode: number;
    };
    status: number;
  };
};

export const UNSENDED_ACTIVITIES = {
  [LANGUAGES.english]: {
    initialBegin: 'You have ',
    initialEnd: ' unsynced activities',
    isLoading: 'Trying to send them',
    success: 'Hurray, sended!',
    error: 'Sorry, we will try again next time',
  },
  [LANGUAGES.russian]: {
    initialBegin: 'У вас есть ',
    initialEnd: ' не синхронизированные активности',
    isLoading: 'Посылаем...',
    success: 'Ура, послали!',
    error: 'Ошибка, попробуем еще раз позже',
  },
};
