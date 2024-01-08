import { LANGUAGES } from '@const/enums';

export const COMMENT_INPUT = {
  [LANGUAGES.english]: {
    label: 'Comment',
    placeholder: 'Add a comment',
  },
  [LANGUAGES.russian]: {
    label: 'Комментарий',
    placeholder: 'Добавьте комментарий',
  },
} as const;

export const COMMENT_ICON_TEST_ID = 'commentInputIcon';
export const COMMENT_INPUT_TEST_ID = 'commentInput';
