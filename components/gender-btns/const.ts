import { LANGUAGES } from '../../constants/enums';

export type GenderBtnsProps = {
  gender: string;
  setGender: (arg: string) => void;
  isDisabled: boolean;
};

export const enum GENDER_BTNS_VALUES {
  male = 'male',
  female = 'female',
  packman = 'packman',
}

export const GENDER_BTNS = {
  [LANGUAGES.english]: {
    maleLabel: 'Male',
    femaleLabel: 'Female',
    packmanLabel: 'Packman',
  },
  [LANGUAGES.russian]: {
    maleLabel: 'Мужык',
    femaleLabel: 'Баба',
    packmanLabel: 'ХЗ',
  },
} as const;
