import { LANGUAGES } from '../../constants/enums';

export const CHECKBOX = {
  [LANGUAGES.english]: {
    public: 'Is this activity visible to your followers?',
  },
  [LANGUAGES.russian]: {
    public: 'Эта активность будет видна вашим друзьям?',
  },
} as const;

export const CHECKBOX_TEST_ID = 'switcher';
