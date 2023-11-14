import { LANGUAGES } from '../../constants/enums';

export type Likes = {
  authorId: string;
  activityId: string;
  date: string;
  id: string;
};

export const NUMBER_OF_LIKES = {
  [LANGUAGES.english]: {
    you: 'You ',
    and: 'and ',
    oneGaveLikes: 'gave like',
    manyGaveLikes: 'gave likes',
    error: 'An error',
  },
  [LANGUAGES.russian]: {
    you: 'Ты ',
    and: 'и еще ',
    oneGaveLikes: 'лайкнул',
    manyGaveLikes: 'лайкнули',
    error: 'Ошибка',
  },
};
