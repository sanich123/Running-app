import { LANGUAGES } from '@const/enums';

export const COMMENT_DELETE_BTN = {
  [LANGUAGES.english]: {
    errorDeleting: 'An error occured while deleting a comment',
  },
  [LANGUAGES.russian]: {
    errorDeleting: 'Во время удаления комментария произошла ошибка',
  },
} as const;
