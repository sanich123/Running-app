import { LANGUAGES } from '@const/enums';

export const COMMENT_INPUT = {
  [LANGUAGES.english]: {
    label: 'Comment',
    placeholder: 'Add a comment',
    errorSending: 'An error occured while sending a comment',
  },
  [LANGUAGES.russian]: {
    label: 'Комментарий',
    placeholder: 'Добавьте комментарий',
    errorSending: 'Во время отправки комментария произошла ошибка',
  },
} as const;

export const COMMENT_ICON_TEST_ID = 'commentInputIcon';
export const COMMENT_INPUT_TEST_ID = 'commentInput';


