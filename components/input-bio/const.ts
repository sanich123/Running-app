import { LANGUAGES } from '../../constants/enums';

export const INPUT_BIO = {
  [LANGUAGES.english]: {
    placeholder: 'Type a few words about yourself',
  },
  [LANGUAGES.russian]: {
    placeholder: 'Пару слов о себе',
  },
};

export type InputBioProps = {
  bio: string;
  setBio: (arg: string) => void;
  isDisabled: boolean;
};

export const INPUT_BIO_TEST_ID = 'inputBio';
