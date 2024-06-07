import { LANGUAGES } from '@const/enums';

export type InputsWeightCityProps = {
  city: string;
  weight: string;
  isDisabled: boolean;
  setCity: (arg: string) => void;
  setWeight: (arg: string) => void;
};

export const WEIGHT_CITY = {
  [LANGUAGES.english]: {
    cityPlaceholder: 'Where are you from',
    weightPlaceholder: 'Type your weight',
    cityLabel: 'City',
    weightLabel: 'Weight (kg)',
  },
  [LANGUAGES.russian]: {
    cityPlaceholder: 'Откуда вы',
    weightPlaceholder: 'Ваш вес',
    cityLabel: 'Город',
    weightLabel: 'Вес (кг)',
  },
} as const;

export const CITY_TEST_ID = 'inputCity';
export const WEIGHT_TEST_ID = 'inputWeight';
