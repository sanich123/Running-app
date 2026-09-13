import { LANGUAGES } from '@const/enums';

export const ERROR_COMPONENT_COPY = {
  [LANGUAGES.english]: {
    title: 'Could not load data',
    subtitle: 'An error occurred',
    retry: 'Retry',
  },
  [LANGUAGES.russian]: {
    title: 'Не удалось загрузить данные',
    subtitle: 'Произошла ошибка',
    retry: 'Повторить',
  },
} as const;

export const ERROR_COMPONENT_TEXT = ERROR_COMPONENT_COPY[LANGUAGES.russian];

export const ERROR_COMPONENT_TEST_ID = 'errorComponentId';
