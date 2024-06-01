import { MutableRefObject, ReactNode } from 'react';

export type CardBtnsProps = {
  activityId: string;
  userId: string;
  cardRef: MutableRefObject<ReactNode>;
  fullViewRef: MutableRefObject<ReactNode | null>;
  isShowDeleteBtn: boolean;
  commentsLength: number;
};
