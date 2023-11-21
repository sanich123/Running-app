import { LANGUAGES } from '../../constants/enums';

export const ACTIVITY_LOCATION_INDICATOR = {
  [LANGUAGES.english]: {
    isLoading: 'Getting your position...',
    isError: 'An error occured',
    isSuccess: 'Have got your position!',
  },
  [LANGUAGES.russian]: {
    isLoading: 'Получаем Ваше местоположение...',
    isError: 'Произошла ошибка',
    isSuccess: 'Получили Ваше местоположение!',
  },
};

export const TIMEOUT_MESSAGE = 10000;
