import { LANGUAGES } from '@const/enums';

export const HEIGHT_AGE = {
  [LANGUAGES.english]: {
    heightLabel: 'Height (cm)',
    heightPlaceholder: 'Your height',
    ageLabel: 'Age',
    agePlaceholder: 'Your age',
    helper: 'Weight, height, age, and gender are used to calculate workout calories',
  },
  [LANGUAGES.russian]: {
    heightLabel: 'Рост (см)',
    heightPlaceholder: 'Ваш рост',
    ageLabel: 'Возраст',
    agePlaceholder: 'Ваш возраст',
    helper: 'Для расчёта калорийности тренировки нужны вес, рост, возраст и пол',
  },
} as const;

export const HEIGHT_TEST_ID = 'inputHeight';
export const AGE_TEST_ID = 'inputAge';
