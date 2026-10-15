import { LANGUAGES } from '@const/enums';

export const WEEK_STATISTICS = {
  [LANGUAGES.russian]: {
    activities: 'Тренировки',
    duration: 'Время',
    distance: 'Расстояние',
    report: 'Ваш недельный отчет',
    error: 'Ошибка',
    errorMessage: 'Не удалось загрузить',
    retry: 'Повторить',
  },
  [LANGUAGES.english]: {
    activities: 'Activities',
    duration: 'Time',
    distance: 'Distance',
    report: 'Your week report',
    error: 'Error',
    errorMessage: 'Could not load',
    retry: 'Retry',
  },
};
