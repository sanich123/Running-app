import { LANGUAGES } from '../../constants/enums';

export const CARD_LIKE_BTN_TEST_ID_LIKED = 'iconLikeButton-liked';
export const CARD_LIKE_BTN_TEST_ID_NOT_LIKED = 'iconLikeButton';
export const CARD_LIKE_BTN_ICON_LIKED = 'thumb-up';
export const CARD_LIKE_BTN_ICON_NOT_LIKED = 'thumb-up-outline';

export const CARD_LIKE_BTN = {
  [LANGUAGES.english]: {
    errorMsg: 'An error occured while sending request to like',
  },
  [LANGUAGES.russian]: {
    errorMsg: 'Произошла ошибка во время отправки лайка',
  },
};
