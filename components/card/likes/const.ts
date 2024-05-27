import { LANGUAGES } from '@const/enums';

export const MAX_IN_ROW = 9;
export const MAX_NUMBER_IN_ROW_OTHER_PAGE = 3;
export const SHIFT_RIGHT = 23;

export enum LikesSize {
  big = 'big',
  small = 'small',
}

export type LikesProps = {
  activityId: string;
  size: LikesSize;
};

export const LIKE_BTN = {
  [LANGUAGES.english]: {
    errorAction: (arg: string) => `An error occured while ${arg === 'delete' ? 'deleting' : 'sending'} like`,
  },
  [LANGUAGES.russian]: {
    errorAction: (arg: string) => `Во время ${arg === 'delete' ? 'удаления' : 'отправки'} лайка возникла ошибка`,
  },
} as const;
