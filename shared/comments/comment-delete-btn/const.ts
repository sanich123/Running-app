import { LANGUAGES } from '@const/enums';

export const COMMENT_DELETE_BTN = {
  [LANGUAGES.english]: {
    errorDeleting: 'An error occured while deleting a comment',
    label: 'Delete',
  },
  [LANGUAGES.russian]: {
    errorDeleting: 'Во время удаления комментария произошла ошибка',
    label: 'Удалить',
  },
} as const;
