import { LANGUAGES } from '@const/enums';

export const enum GENDER_BTNS_VALUES {
  male = 'male',
  female = 'female',
  packman = 'packman',
}

export const GENDER_BTNS = {
  [LANGUAGES.english]: {
    maleLabel: 'Male',
    femaleLabel: 'Female',
  },
  [LANGUAGES.russian]: {
    maleLabel: 'Мужчина',
    femaleLabel: 'Женщина',
  },
} as const;
