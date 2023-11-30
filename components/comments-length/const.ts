import { LANGUAGES } from '../../constants/enums';

export const COMMENTS_LENGTH_TEST_ID = 'commentsLengthBtn';
export const COMMENTS_ENDING = {
  [LANGUAGES.english]: {
    oneComment: 'comment',
    manyComments: 'comments',
    error: 'An error',
  },
  [LANGUAGES.russian]: {
    oneComment: 'комментарий',
    twoFourComments: 'комментария',
    fiveZeroComments: 'комментариев',
    error: 'Ошибка',
  },
} as const;

export function getWordEnding(commentsLength: number, language: LANGUAGES) {
  const commentsLengthString = commentsLength.toString();
  const lastNumber = +commentsLengthString[commentsLengthString.length - 1];
  if (lastNumber === 1) {
    return COMMENTS_ENDING[language].oneComment;
  } else if (lastNumber > 1 && lastNumber < 5) {
    if (language === LANGUAGES.english) {
      return COMMENTS_ENDING[language].manyComments;
    } else {
      return COMMENTS_ENDING[language].twoFourComments;
    }
  } else if (language === LANGUAGES.english) {
    return COMMENTS_ENDING[language].manyComments;
  } else {
    return COMMENTS_ENDING[language].fiveZeroComments;
  }
}
