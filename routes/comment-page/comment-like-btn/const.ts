import { LANGUAGES } from '@const/enums';

export const COMMENT_LIKE_BTN = {
  [LANGUAGES.english]: {
    errorSending: 'An error occured while sending a like',
  },
  [LANGUAGES.russian]: {
    errorSending: 'Во время отправки лайка произошла ошибка',
  },
} as const;
